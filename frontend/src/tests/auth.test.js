import {signup,login,getMe,updateMe,changePassword,deleteAccount,forgotPassword,resetPassword,logout,} from "../api/auth";
import client from "../api/client";
jest.mock("../api/client",()=>({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));
describe("Auth API",()=>{
  beforeEach(()=>{jest.clearAllMocks();});

  describe("signup",()=>{
    test("signs up successfully",async()=>{
      const payload = {name: "Naveen",email: "naveen@example.com",password: "password123",};
      const data = {message: "Signup successful",
        user: {name: "Naveen",email: "naveen@example.com",},};
      client.post.mockResolvedValueOnce({ data,});
      const result = await signup(payload);
      expect(client.post).toHaveBeenCalledWith("/auth/signup",payload);
      expect(result).toEqual(data);});
    test("throws API error when signup fails", async () => {
      client.post.mockRejectedValueOnce({response: {status: 400,data: {message: "Email already exists",},},});
      await expect(signup({email: "naveen@example.com",password: "password123",})).rejects.toMatchObject({message: "Email already exists",status: 400,});});
  });
  describe("login", () => {
    test("logs in successfully",async()=>{
      const payload = {email: "naveen@example.com",password: "password123",};
      const data = {message: "Login successful",user:{email: "naveen@example.com",},};
      client.post.mockResolvedValueOnce({data,});
      const result = await login(payload);
      expect(client.post).toHaveBeenCalledWith("/auth/login",payload);
      expect(result).toEqual(data);
    });
    test("throws API error when login fails", async () => {
      client.post.mockRejectedValueOnce({response:{status: 401,data: {message: "Invalid credentials",},},});
      await expect(login({email: "naveen@example.com",password: "wrong",})).rejects.toMatchObject({message: "Invalid credentials",status: 401,});});});

  describe("getMe", () => {
    test("gets current user successfully", async () => {
      const data = {_id: "123",name: "Naveen",email: "naveen@example.com",};
      client.get.mockResolvedValueOnce({data,});
      const result = await getMe();
      expect(client.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(data);
    });
    test("throws error when current user cannot be loaded", async () => {
      client.get.mockRejectedValueOnce({ response: {status: 401,data: { message: "Unauthorized",},},});
      await expect(getMe()).rejects.toMatchObject({ message: "Unauthorized",status: 401,});
    });
  });

  describe("updateMe", () => {
    test("updates current user successfully", async () => {
      const payload = {name: "Updated Name",categories: ["Work", "Personal"],};
      const data ={message: "Profile updated",user: {name: "Updated Name",categories: ["Work", "Personal"],},};
      client.patch.mockResolvedValueOnce({data,});
      const result = await updateMe(payload);
      expect(client.patch).toHaveBeenCalledWith("/auth/me", payload);
      expect(result).toEqual(data);
    });
    test("throws API error when profile update fails", async () => {
      client.patch.mockRejectedValueOnce({response: {status: 400,data: {message: "Could not update profile",
          },},
      });
      await expect(
        updateMe({name:"Updated",})).rejects.toMatchObject({
        message: "Could not update profile",status: 400,});
    });
  });

  describe("changePassword",()=>{
    test("changes password successfully",async()=>{
      const payload={currentPassword: "oldPassword",newPassword: "newPassword",};
      const data ={message: "Password changed successfully",};
      client.patch.mockResolvedValueOnce({data,});
      const result = await changePassword(payload);
      expect(client.patch).toHaveBeenCalledWith("/auth/change-password", payload );
      expect(result).toEqual(data);
    });
    test("throws API error when password change fails", async () => {
      client.patch.mockRejectedValueOnce({response: {status: 400,data: {message: "Current password is incorrect",},},});
      await expect(changePassword({currentPassword: "wrong",newPassword: "newPassword",})).rejects.toMatchObject({message: "Current password is incorrect",status: 400,});});
  });

  describe("deleteAccount",()=>{
    test("deletes account successfully",async()=>{
      const data = {message: "Account deleted successfully",};
      client.delete.mockResolvedValueOnce({data,});
      const result = await deleteAccount();
      expect(client.delete).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(data);
    });

    test("throws API error when account deletion fails", async () => {
      client.delete.mockRejectedValueOnce({response: {status: 500,data: {message: "Could not delete account",},}, });
      await expect(deleteAccount()).rejects.toMatchObject({message: "Could not delete account",status: 500,});
    });
  });
  describe("forgotPassword",()=>{
    test("sends password reset request successfully", async () => {
      const payload = {email: "naveen@example.com",};
      const data = {message: "Reset instructions sent",};
      client.post.mockResolvedValueOnce({data,});
      const result = await forgotPassword(payload);
      expect(client.post).toHaveBeenCalledWith("/auth/forgot-password",payload);
      expect(result).toEqual(data);
    });
    test("throws API error when forgot password fails", async () => {
      client.post.mockRejectedValueOnce({response: {status: 404,data: {message: "User not found",},},});
      await expect(forgotPassword({email: "unknown@example.com",})).rejects.toMatchObject({message: "User not found",status: 404,});});});
  describe("resetPassword",()=>{
    test("resets password successfully",async()=>{
      const payload = {token: "reset-token",password: "newPassword123",};
      const data = {message: "Password reset successfully",};
      client.post.mockResolvedValueOnce({data,});
      const result = await resetPassword(payload);
      expect(client.post).toHaveBeenCalledWith("/auth/reset-password",payload);
      expect(result).toEqual(data);
    });
    test("throws API error when reset password fails", async () => {
      client.post.mockRejectedValueOnce({response: {status: 400,data: {message: "Invalid or expired token",},},});
      await expect(resetPassword({token: "invalid-token",password: "newPassword",})).rejects.toMatchObject({message: "Invalid or expired token",status: 400,});
    });
  });

  describe("logout",()=>{
    test("logs out successfully",async()=>{
      const data = {message: "Logged out successfully",};
      client.post.mockResolvedValueOnce({data,});
      const result = await logout();
      expect(client.post).toHaveBeenCalledWith("/auth/logout");
      expect(result).toEqual(data);
    });

    test("throws API error when logout fails", async () => {
      client.post.mockRejectedValueOnce({response: {status: 500,data: {message: "Logout failed",},},});

      await expect(logout()).rejects.toMatchObject({message: "Logout failed",status: 500,});});
  });
});