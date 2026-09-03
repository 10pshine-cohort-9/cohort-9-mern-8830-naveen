import {getNotes,getNote,createNote,updateNote,deleteNote,} from "../api/notes";
import client from "../api/client";
jest.mock("../api/client",()=>({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));
describe("Notes API",()=> {
  beforeEach(()=>{
    jest.clearAllMocks();
  });
  describe("getNotes",()=>{
    test("returns notes successfully",async()=>{
      const data={notes:[{_id: "1",title: "Test Note",},],};
      client.get.mockResolvedValueOnce({data,});
      const params={category: "Work",search: "test",};
      const result = await getNotes(params);
      expect(client.get).toHaveBeenCalledWith("/notes",{params,});
      expect(result).toEqual(data);
    });
    test("throws API error message when request fails",async()=>{
      client.get.mockRejectedValueOnce({response:{status:500,data:{message:"Could not load notes", }, },});
      await expect(getNotes()).rejects.toMatchObject({
        message: "Could not load notes",
        status: 500,
      });
    });
    test("uses default error message when API message is missing",async()=>{
      client.get.mockRejectedValueOnce({response:{status:500,data: {},},});
      await expect(getNotes()).rejects.toMatchObject({message: "Could not load notes.",status: 500,});
    });
  });
  describe("getNote",()=>{
    test("returns a note successfully",async()=> {
      const data={_id:"123",title:"My Note",content:"<p>Hello</p>",};
      client.get.mockResolvedValueOnce({data,});
      const result = await getNote("123");
      expect(client.get).toHaveBeenCalledWith("/notes/123");
      expect(result).toEqual(data);
    });
    test("throws API error when request fails",async()=>{
      client.get.mockRejectedValueOnce({response: {status: 404,data:{message:"Note not found",},},});
      await expect(getNote("123")).rejects.toMatchObject({message:"Note not found",status: 404,});
    });
  });
  describe("createNote", ()=> {
    test("creates a note successfully",async() => {
      const payload= {title:"New Note",category:"Work",content:"<p>Hello</p>",isFavourite: false,};
      const data ={_id: "123",...payload,};
      client.post.mockResolvedValueOnce({data,});
      const result = await createNote(payload);
      expect(client.post).toHaveBeenCalledWith("/notes", payload);
      expect(result).toEqual(data);
    });
    test("throws API error when creation fails",async()=>{
      client.post.mockRejectedValueOnce({response:{status:400,data:{message: "Could not create note",},},});
      await expect(
        createNote({title: "Test",})).rejects.toMatchObject({message: "Could not create note",status: 400,});
    });
  });
  describe("updateNote", ()=>{
    test("updates a note successfully", async()=> {
      const payload={title: "Updated Note",content: "<p>Updated</p>",};
      const data = {_id: "123",...payload,};
      client.patch.mockResolvedValueOnce({data,});
      const result = await updateNote("123", payload);
      expect(client.patch).toHaveBeenCalledWith("/notes/123",payload);
      expect(result).toEqual(data);
    });
    test("throws API error when update fails",async()=>{
      client.patch.mockRejectedValueOnce({response: {status: 404,data:{message: "Note not found",},},});
      await expect(updateNote("123",{title: "Updated",})).rejects.toMatchObject({message: "Note not found",status: 404,});
    });
  });
  describe("deleteNote",()=>{
    test("deletes a note successfully",async()=>{
      const data={message: "Note deleted successfully",};
      client.delete.mockResolvedValueOnce({data,});
      const result = await deleteNote("123");
      expect(client.delete).toHaveBeenCalledWith("/notes/123");
      expect(result).toEqual(data);
    });
    test("throws API error when deletion fails",async()=>{
      client.delete.mockRejectedValueOnce({response:{status: 404,data:{message: "Note not found",},},});
      await expect(deleteNote("123")).rejects.toMatchObject({message: "Note not found",status: 404,});
      });
  });
});