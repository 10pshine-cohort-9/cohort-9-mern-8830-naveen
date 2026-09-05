const {expect} = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('categoryController', () => {
    let categoryController;
    let Category;
    let AppError;
    let catchAsync;
    const userId = 1;
    beforeEach(() => {
        Category = {
            findAll: sinon.stub(),
            findOne: sinon.stub(),
            create: sinon.stub(),
        };
        AppError = class AppError extends Error {
            constructor(message, statusCode) {
                super(message);
                this.statusCode = statusCode;
            }
        };
        catchAsync = (fn) => fn;
        categoryController = proxyquire('../src/controllers/categoryController', {
            '../models/Category': Category,
            '../utils/AppError': AppError,
            '../middleware/catchAsync': catchAsync,
        });
    });
    afterEach(() => {
        sinon.restore();
    });
    describe('getCategories', () => {
        it('should return all categories for the logged-in user', async () => {
            const categories = [{id: 1, name: 'Work', userId},{id: 2, name: 'Personal', userId},];
            Category.findAll.resolves(categories);
            const req = {user: {id: userId,},};
            const res = {status: sinon.stub().returnsThis(),json: sinon.spy(),};
            await categoryController.getCategories(req, res);
            expect(Category.findAll.calledOnce).to.equal(true);
            expect(Category.findAll.firstCall.args[0]).to.deep.equal({where: {userId,},order: [['createdAt', 'ASC']],});
            expect(res.status.calledWith(200)).to.equal(true);
            expect(res.json.calledWith({success: true,categories,})).to.equal(true);
        });

        it('should propagate an error when fetching categories fails', async () => {
            const error = new Error('Database error');
            Category.findAll.rejects(error);
            const req = {user: {id: userId,},};
            const res = {};
            try{
                await categoryController.getCategories(req, res);
                throw new Error('Expected getCategories to reject');
            }
            catch (err){
                expect(err).to.equal(error);
            }
        });
    });
    describe('createCategory', () => {
        it('should return 400 when category name is empty', async () => {
            const req = {body: {name: '   ',},user: {id: userId,},};
            const next = sinon.spy();
            await categoryController.createCategory(req, {}, next);
            expect(next.calledOnce).to.equal(true);
            const error = next.firstCall.args[0];
            expect(error).to.be.instanceOf(AppError);
            expect(error.message).to.equal('Category name is required.');
            expect(error.statusCode).to.equal(400);
            expect(Category.findOne.called).to.equal(false);
            expect(Category.create.called).to.equal(false);
        });

        it('should return 409 when category already exists', async () => {
            Category.findOne.resolves({id: 1,name: 'Work',userId,});
            const req = {body: {name: ' Work ',},user: {id: userId,},};
            const next = sinon.spy();
            await categoryController.createCategory(req, {}, next);
            expect(Category.findOne.calledOnce).to.equal(true);
            expect(Category.findOne.firstCall.args[0]).to.deep.equal({where:{name: 'Work',userId,},});
            expect(next.calledOnce).to.equal(true);
            const error = next.firstCall.args[0];
            expect(error).to.be.instanceOf(AppError);
            expect(error.message).to.equal('Category already exists.');
            expect(error.statusCode).to.equal(409);
            expect(Category.create.called).to.equal(false);
        });
        it('should create and return a new category', async () => {
            const category = {id: 2,name: 'Personal',userId,};
            Category.findOne.resolves(null);
            Category.create.resolves(category);
            const req ={body: {name: ' Personal ',},user: {id: userId,},};
            const res ={status: sinon.stub().returnsThis(),json: sinon.spy(),};
            const next = sinon.spy();
            await categoryController.createCategory(req, res, next);
            expect(Category.findOne.calledOnce).to.equal(true);
            expect(Category.create.calledOnce).to.equal(true);
            expect(Category.create.firstCall.args[0]).to.deep.equal({name: 'Personal',userId,});
            expect(res.status.calledWith(201)).to.equal(true);
            expect(res.json.calledWith({success: true,category,})).to.equal(true);
            expect(next.called).to.equal(false);
        });
        it('should propagate an error when checking for an existing category fails', async () => {
            const error = new Error('Database error');
            Category.findOne.rejects(error);
            const req = {body:{name: 'Work',},user: {id: userId,},};
            const next = sinon.spy();
            try{
                await categoryController.createCategory(req, {}, next);
                throw new Error('Expected createCategory to reject');
            }
            catch (err){
                expect(err).to.equal(error);
            }
        });
    });
    describe('deleteCategory', () => {
        it('should return 404 when category does not exist', async () => {
            Category.findOne.resolves(null);
            const req = {params: {id: 999,},user: {id: userId,},};
            const next = sinon.spy();
            await categoryController.deleteCategory(req, {}, next);
            expect(Category.findOne.calledOnce).to.equal(true);
            expect(Category.findOne.firstCall.args[0]).to.deep.equal({where: {id: 999,userId,},});
            expect(next.calledOnce).to.equal(true);
            const error = next.firstCall.args[0];
            expect(error).to.be.instanceOf(AppError);
            expect(error.message).to.equal('Category not found.');
            expect(error.statusCode).to.equal(404);
        });
        it('should delete the category successfully', async () => {
            const destroy = sinon.stub().resolves();
            const category ={id: 5,name: 'Work',userId,destroy,};
            Category.findOne.resolves(category);
            const req = {params: {id: 5,},user: {id: userId,},};
            const res = {status: sinon.stub().returnsThis(),json: sinon.spy(),};
            const next = sinon.spy();
            await categoryController.deleteCategory(req, res, next);
            expect(Category.findOne.calledOnce).to.equal(true);
            expect(destroy.calledOnce).to.equal(true);
            expect(res.status.calledWith(200)).to.equal(true);
            expect(res.json.calledWith({success: true,message: 'Category deleted successfully.',})).to.equal(true);
            expect(next.called).to.equal(false);
        });
        it('should propagate an error when finding the category fails', async () => {
            const error = new Error('Database error');
            Category.findOne.rejects(error);
            const req = {params:{id: 5,},user: {id: userId,},};
            const next = sinon.spy();
            try{
                await categoryController.deleteCategory(req, {}, next);
                throw new Error('Expected deleteCategory to reject');
            }
            catch(err){
                expect(err).to.equal(error);
            }
        });
        it('should propagate an error when deleting the category fails', async () => {
            const error = new Error('Delete failed');
            const destroy = sinon.stub().rejects(error);
            Category.findOne.resolves({id: 5,name: 'Work',userId,destroy,});
            const req = {params: {id: 5,},user:{id: userId,},};
            const next = sinon.spy();
            try{
                await categoryController.deleteCategory(req, {}, next);
                throw new Error('Expected deleteCategory to reject');
            }
            catch (err){
                expect(err).to.equal(error);
            }
        });
    });
});