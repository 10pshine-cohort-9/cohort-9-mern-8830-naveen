const request = require('supertest');
const {expect} = require('chai');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const {User,Note} = require('../src/models');
const authRateLimit = require('../src/middleware/authRateLimit');
describe('Auth Controller - Additional Coverage', function () {
    beforeEach(function(){
        authRateLimit.reset();
    });
    const signupAgent = async (suffix = Date.now())=>{
        const testAgent = request.agent(app);
        const response = await testAgent
            .post('/api/auth/signup')
            .send({fullName: 'Test User',email: `test${suffix}@example.com`,password: 'Password123',});
        expect(response.status).to.equal(201);
        return testAgent;
    };

    describe('POST /api/auth/signup', function () {
        it('creates a new user successfully', async function () {
            const email =`signup-success-${Date.now()}@example.com`;
            const response = await request(app)
                .post('/api/auth/signup')
                .send({fullName: 'Signup User',email: `  ${email}  `,password: 'Password123',});
            expect(response.status).to.equal(201);
            expect(response.body.success).to.equal(true);
            expect(response.body.user).to.have.property('id');
            expect(response.body.user.fullName).to.equal('Signup User');
            expect(response.body.user.email).to.equal(email.toLowerCase());
            expect(response.body.user).to.not.have.property('passwordHash');
            const user = await User.findOne({where: {email: email.toLowerCase(),},});
            expect(user).to.not.be.null;
            await user.destroy();
        });
        it('rejects a password shorter than 8 characters', async function () {
            const response = await request(app)
                .post('/api/auth/signup')
                .send({fullName: 'Short Password',email: `short${Date.now()}@example.com`,password: '1234567',});
            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
        });
        it('rejects duplicate email addresses', async function () {
            const email =`duplicate${Date.now()}@example.com`;
            const firstResponse = await request(app)
                .post('/api/auth/signup')
                .send({fullName: 'First User',email,password: 'Password123',});
            expect(firstResponse.status).to.equal(201);
            const secondResponse = await request(app)
                .post('/api/auth/signup')
                .send({fullName: 'Second User',email,password: 'Password123',});
            expect(secondResponse.status).to.equal(409);
            expect(secondResponse.body.success).to.equal(false);
            const user = await User.findOne({where:{email},});
            if(user){
                await user.destroy();
            }
        });
        it('trims the full name and normalizes the email', async function () {
            const email =`normalize${Date.now()}@example.com`;
            const response = await request(app)
                .post('/api/auth/signup')
                .send({fullName: '   Normalized User   ',email: `   ${email.toUpperCase()}   `,password: 'Password123',});
            expect(response.status).to.equal(201);
            expect(response.body.success).to.equal(true);
            expect(response.body.user.fullName).to.equal('Normalized User');
            expect(response.body.user.email).to.equal(email.toLowerCase());
            const user = await User.findOne({where:{email},});
            if(user){
                await user.destroy();
            }
        });
    });
    describe('POST /api/auth/login', function () {
        it('logs in successfully with valid credentials', async function () {
            const email =`login-success-${Date.now()}@example.com`;
            const signupResponse = await request(app)
                .post('/api/auth/signup')
                .send({fullName: 'Login User',email,password: 'Password123',});
            expect(signupResponse.status).to.equal(201);
            const response = await request(app)
                .post('/api/auth/login')
                .send({email,password: 'Password123',});
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.user).to.have.property('id');
            expect(response.body.user.email).to.equal(email);
            const user = await User.findOne({where:{email},});
            if(user){
                await user.destroy();
            }
        });
        it('normalizes the email during login', async function () {
            const email =`login-normalize-${Date.now()}@example.com`;
            const signupResponse = await request(app)
                .post('/api/auth/signup')
                .send({fullName: 'Login Normalize User',email,password: 'Password123',});
            expect(signupResponse.status).to.equal(201);
            const response = await request(app)
                .post('/api/auth/login')
                .send({email: `  ${email.toUpperCase()}  `, password: 'Password123',});
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            const user = await User.findOne({where: { email },});
            if(user){
                await user.destroy();
            }
        });
        it('rejects login when the email does not exist', async function () {
            const response = await request(app)
                .post('/api/auth/login')
                .send({email:`missing-login-${Date.now()}@example.com`,password: 'Password123',});
            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
        });
        it('rejects login when the password is incorrect', async function () {
            const email =`wrong-password-${Date.now()}@example.com`;
            const signupResponse = await request(app)
                .post('/api/auth/signup')
                .send({fullName: 'Wrong Password User',email,password: 'Password123',});
            expect(signupResponse.status).to.equal(201);
            const response = await request(app)
                .post('/api/auth/login')
                .send({email,password: 'WrongPassword123',});
            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
            const user = await User.findOne({where: { email },});
            if(user){
                await user.destroy();
            }
        });

    });
    describe('GET /api/auth/me', function () {
        it('returns the authenticated user', async function () {
            const testAgent = await signupAgent();
            const response = await testAgent.get('/api/auth/me');
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.user).to.have.property('id');
            expect(response.body.user).to.have.property('email');
            expect(response.body.user).to.have.property('fullName');
            expect(response.body.user).to.have.property('categories');
        });
    });
    describe('PATCH /api/auth/me', function () {
        it('updates allowed profile fields', async function () {
            const testAgent = await signupAgent();
            const response = await testAgent
                .patch('/api/auth/me')
                .send({fullName: 'Updated User',tagline: 'New tagline',theme: 'dark',language: 'en',timezone: 'Asia/Karachi',});
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.user.fullName).to.equal('Updated User');
            expect(response.body.user.tagline).to.equal('New tagline');
            expect(response.body.user.theme).to.equal('dark');
            expect(response.body.user.language).to.equal('en');
            expect(response.body.user.timezone).to.equal('Asia/Karachi');
        });
        it('updates categories', async function () {
            const testAgent = await signupAgent();
            const categories = ['Work','Personal','Study',];
            const response = await testAgent
                .patch('/api/auth/me')
                .send({categories,});
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.user.categories).to.deep.equal(categories);
        });
        it('updates both profile fields and categories', async function () {
            const testAgent = await signupAgent();
            const categories = ['Work','Travel',];
            const response = await testAgent
                .patch('/api/auth/me')
                .send({fullName: 'Complete Update',tagline: 'Updated tagline',theme: 'light',language: 'en',timezone: 'UTC',categories,});
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.user.fullName).to.equal('Complete Update');
            expect(response.body.user.tagline).to.equal('Updated tagline');
            expect(response.body.user.theme).to.equal('light');
            expect(response.body.user.language).to.equal('en');
            expect(response.body.user.timezone).to.equal('UTC');
            expect(response.body.user.categories).to.deep.equal(categories);
        });
        it('ignores fields that are not allowed', async function () {
            const testAgent = await signupAgent();
            const response = await testAgent
                .patch('/api/auth/me')
                .send({email: 'hacker@example.com',passwordHash: 'changed-password',accountType: 'admin',id: 999999,});
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.user.email).to.not.equal('hacker@example.com');
            expect(response.body.user.accountType).to.not.equal('admin');
            expect(response.body.user.id).to.not.equal(999999);
        });
        it('allows an empty update request', async function () {
            const testAgent = await signupAgent();
            const response = await testAgent
                .patch('/api/auth/me')
                .send({});
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.user).to.have.property('id');
        });
    });
    describe('PATCH /api/auth/change-password', function () {
        it('rejects a new password shorter than 8 characters', async function () {
            const testAgent = await signupAgent();
            const response = await testAgent
                .patch('/api/auth/change-password')
                .send({currentPassword: 'Password123',newPassword: '1234567',});
            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
        });
        it('rejects an incorrect current password', async function () {
            const testAgent = await signupAgent();
            const response = await testAgent
                .patch('/api/auth/change-password')
                .send({currentPassword: 'WrongPassword123',newPassword: 'NewPassword123',});
            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
        });
        it('changes the password successfully', async function () {
            const email =`changepassword${Date.now()}@example.com`;
            const testAgent = request.agent(app);
            await testAgent
                .post('/api/auth/signup')
                .send({fullName: 'Password User',email,password: 'Password123',})
                .expect(201);
            const response = await testAgent
                .patch('/api/auth/change-password')
                .send({currentPassword: 'Password123',newPassword: 'NewPassword123',});
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.message).to.equal('Password updated successfully.');
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({email,password: 'NewPassword123',});
            expect(loginResponse.status).to.equal(200);
            expect(loginResponse.body.success).to.equal(true);
            const user = await User.findOne({where: { email },});
            if(user){
                await user.destroy();
            }
        });
        it('allows login with the new password', async function () {
            const email =`newpassword${Date.now()}@example.com`;
            const testAgent = request.agent(app);
            await testAgent
                .post('/api/auth/signup')
                .send({fullName: 'Password Login User',email,password: 'Password123',})
                .expect(201);
            await testAgent
                .patch('/api/auth/change-password')
                .send({currentPassword: 'Password123',newPassword: 'NewPassword123',})
                .expect(200);
            const response = await request(app)
                .post('/api/auth/login')
                .send({email,password: 'NewPassword123',});
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            const user = await User.findOne({where: { email },});
            if(user){
                await user.destroy();
            }
        });

    });
    describe('POST /api/auth/forgot-password', function () {
        it('returns success even when the email does not exist', async function () {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({email: `unknown${Date.now()}@example.com`,});
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
        });

    });
    describe('POST /api/auth/reset-password', function () {
        it('rejects a new password shorter than 8 characters', async function () {
            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({token: 'invalid-token',newPassword: '1234567',});
            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
        });
        it('rejects an invalid reset token', async function(){
            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({token: 'invalid-reset-token',newPassword: 'NewPassword123',});
            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
        });
        it('rejects an expired reset token', async function () {
            const rawToken = 'expired-token';
            const user = await User.create({
                fullName: 'Expired User',
                email:`expired${Date.now()}@example.com`,
                passwordHash: await bcrypt.hash('OldPassword123',12),
                resetPasswordToken: crypto
                    .createHash('sha256')
                    .update(rawToken)
                    .digest('hex'),
                resetPasswordExpiresAt:new Date(Date.now() - 1000),
            });
            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({token: rawToken,newPassword: 'NewPassword123',});
            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
            await user.destroy();
        });
        it('resets the password with a valid token', async function () {
            const rawToken = 'valid-reset-token';
            const user = await User.create({
                fullName: 'Reset User',
                email:`reset${Date.now()}@example.com`,
                passwordHash: await bcrypt.hash('OldPassword123',12),
                resetPasswordToken: crypto
                    .createHash('sha256')
                    .update(rawToken)
                    .digest('hex'),
                resetPasswordExpiresAt:new Date(Date.now() + 15 * 60 * 1000),
            });
            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({token: rawToken,newPassword: 'NewPassword123',});
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            const updatedUser =await User.findByPk(user.id);
            expect(updatedUser.resetPasswordToken).to.be.null;
            expect(updatedUser.resetPasswordExpiresAt).to.be.null;
            const passwordMatches =await bcrypt.compare('NewPassword123',updatedUser.passwordHash);
            expect(passwordMatches).to.equal(true);
            await updatedUser.destroy();
        });
        it('allows login with the reset password', async function () {
            const rawToken ='valid-login-reset-token';
            const user = await User.create({
                fullName: 'Reset Login User',
                email:`resetlogin${Date.now()}@example.com`,
                passwordHash: await bcrypt.hash('OldPassword123',12),
                resetPasswordToken: crypto
                    .createHash('sha256')
                    .update(rawToken)
                    .digest('hex'),
                resetPasswordExpiresAt:new Date(Date.now() + 15 * 60 * 1000),
            });
            await request(app)
                .post('/api/auth/reset-password')
                .send({token: rawToken,newPassword: 'NewPassword123',})
                .expect(200);
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({email: user.email,password: 'NewPassword123',});
            expect(loginResponse.status).to.equal(200);
            expect(loginResponse.body.success).to.equal(true);
            await user.destroy();
        });

    });
    describe('POST /api/auth/logout', function () {
        it('clears the authentication cookie', async function () {
            const testAgent = await signupAgent();
            const response = await testAgent.post('/api/auth/logout');
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.message).to.equal('Logged out successfully.');
        });

    });
    describe('DELETE /api/auth/me', function () {
        it('deletes the authenticated account and associated notes', async function () {
            const email =`delete${Date.now()}@example.com`;
            const testAgent = request.agent(app);
            const signupResponse = await testAgent
                .post('/api/auth/signup')
                .send({fullName: 'Delete User',email,password: 'Password123',});
            expect(signupResponse.status).to.equal(201);
            const user = await User.findOne({where:{email},});
            expect(user).to.not.be.null;
            await Note.create({userId: user.id,title: 'Test Note',content: 'Test note content',});
            const deleteResponse = await testAgent
                .delete('/api/auth/me');
            expect(deleteResponse.status).to.equal(200);
            expect(deleteResponse.body.success).to.equal(true);
            expect(deleteResponse.body.message).to.equal('Account deleted successfully.');
            const deletedUser =await User.findByPk(user.id);
            expect(deletedUser).to.be.null;
            const remainingNotes =
                await Note.findAll({
                    where: {userId: user.id,},
                });
            expect(remainingNotes).to.have.length(0);
        });

    });

});