import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import * as authApi from "../api/auth";
jest.mock("../api/auth");
const mockUser = {id: 1, name: "John Doe", email: "john@example.com",};
let refreshUser;
const TestComponent = () => {
  const {user, loading,authError, signup,login, logout, refreshUser:contextRefreshUser,setUser, }=useAuth();
  refreshUser = contextRefreshUser;
  return (
    <div>
      <div data-testid="user"> {user? JSON.stringify(user) :"No user"}</div>
      <div data-testid="loading">{loading ? "loading" : "loaded"}</div>
      <div data-testid="error"> {authError ? authError.message : "No error"}</div>
      <button onClick={() =>signup({name: "John Doe",email: "john@example.com",password: "password",})}>Signup</button>
      <button onClick={() => login({email: "john@example.com",password: "password",}) }>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={()=>refreshUser()}>Refresh User</button>
      <button onClick={() => setUser({ id: 99, name: "Changed User" })}>Set User</button>
    </div>
  );
};
const renderAuth=()=>{
  return render(
    <AuthProvider><TestComponent /></AuthProvider>
  );
};
describe("AuthContext",()=>{
  beforeEach(()=>{ jest.clearAllMocks();});
  describe("initial authentication", () => {
    it("starts loading and loads the current user successfully",async()=>{authApi.getMe.mockResolvedValue({user: mockUser,});
      renderAuth();
      expect(screen.getByTestId("loading")).toHaveTextContent("loading");
      await waitFor(()=>{
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
      expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(mockUser));
      expect(authApi.getMe).toHaveBeenCalledTimes(1);
    });
    it("sets user to null when getMe returns 401", async () => {
      const error = {response:{ status: 401, },};
      authApi.getMe.mockRejectedValue(error);
      renderAuth();
      await waitFor(()=>{
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
      expect(screen.getByTestId("user")).toHaveTextContent("No user");
      expect(screen.getByTestId("error")).toHaveTextContent("No error");
    });
    it("sets user to null when getMe returns 403", async () => {
      const error = {response: { status: 403,}, };
      authApi.getMe.mockRejectedValue(error);
      renderAuth();
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
      expect(screen.getByTestId("user")).toHaveTextContent("No user");
      expect(screen.getByTestId("error")).toHaveTextContent("No error");
    });
    it("sets authError for non-authentication errors", async () => {
      const error = new Error("Server error");
      authApi.getMe.mockRejectedValue(error);
      renderAuth();
      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Server error");
      });
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      expect(screen.getByTestId("user")).toHaveTextContent("No user");
    });
  });
  describe("signup",()=>{
    it("calls signup API, sets the user and returns the response", async () => {
      const response={user: mockUser,token: "signup-token",};
      authApi.signup.mockResolvedValue(response);
      renderAuth();
      await waitFor(()=>{
        expect(authApi.getMe).toHaveBeenCalled();
      });
      fireEvent.click(screen.getByText("Signup"));
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(mockUser));
      });
      expect(authApi.signup).toHaveBeenCalledWith({name: "John Doe", email: "john@example.com",password: "password",});});
    it("propagates signup errors",async()=>{
      const error= new Error("Signup failed");
      authApi.signup.mockRejectedValue(error);
      renderAuth();
      await waitFor(()=>{
        expect(authApi.getMe).toHaveBeenCalled();
      });
      await expect(
        authApi.signup({email: "john@example.com",password: "password",})).rejects.toThrow("Signup failed");});});
  describe("login", () => {
    it("calls login API, sets the user and returns the response", async () => {
      const response={user: mockUser,token: "login-token",};
      authApi.login.mockResolvedValue(response);
      renderAuth();
      await waitFor(()=>{
        expect(authApi.getMe).toHaveBeenCalled();
      });
      fireEvent.click(screen.getByText("Login"));
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(mockUser));
      });
      expect(authApi.login).toHaveBeenCalledWith({ email: "john@example.com",password: "password", });
    });
    it("propagates login errors", async()=>{
      const error = new Error("Invalid credentials");
      authApi.login.mockRejectedValue(error);
      renderAuth();
      await waitFor(()=>{
        expect(authApi.getMe).toHaveBeenCalled();
      });
      await expect(
        authApi.login({ email: "john@example.com",password: "wrong",}) ).rejects.toThrow("Invalid credentials");});
  });
  describe("logout",()=>{
    it("calls logout API and clears the user",async()=> {
      authApi.getMe.mockResolvedValue({user: mockUser,});
      authApi.logout.mockResolvedValue({});
      renderAuth();
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(mockUser));
      });
      fireEvent.click(screen.getByText("Logout"));
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent("No user");
      });
      expect(authApi.logout).toHaveBeenCalledTimes(1);
    });
    it("clears the user even when logout API fails", async () => {
      authApi.getMe.mockResolvedValue({user: mockUser,});
      authApi.logout.mockRejectedValue(new Error("Logout failed"));
      renderAuth();
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(mockUser));
      });
      fireEvent.click(screen.getByText("Logout"));
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent("No user");
      });
      expect(authApi.logout).toHaveBeenCalledTimes(1);
    });
  });
  describe("refreshUser", () => {
    it("refreshes and updates the current user", async()=>{
      authApi.getMe.mockResolvedValueOnce({user: mockUser, }).mockResolvedValueOnce({user: {...mockUser,name: "Updated User", },});
      renderAuth();
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(mockUser));
      });
      fireEvent.click(screen.getByText("Refresh User"));
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent("Updated User");
      });
      expect(authApi.getMe).toHaveBeenCalledTimes(2);
    });
    it("returns the refreshed user", async () => {
      authApi.getMe.mockResolvedValue({
        user: mockUser,
      });
      let result;
      const TestRefresh = () => {
        const {refreshUser}=useAuth();
        return (
          <button onClick={async ()=>{result= await refreshUser();}}> Refresh</button>
        );
      };
      render(
        <AuthProvider><TestRefresh /> </AuthProvider>
      );
      await waitFor(()=>{
        expect(authApi.getMe).toHaveBeenCalledTimes(1);
      });
      fireEvent.click(screen.getByText("Refresh"));
      await waitFor(()=>{
        expect(result).toEqual(mockUser);
      });
    });
    it("logs out when refreshUser returns 401", async () => {
      authApi.getMe
        .mockResolvedValueOnce({ user: mockUser,})
        .mockRejectedValueOnce({
          response: { status: 401,}, });
      authApi.logout.mockResolvedValue({});
      renderAuth();
      await waitFor(()=> {
        expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(mockUser));
      });
      await expect(refreshUser()).rejects.toMatchObject({
        response: { status: 401 },
      });
      await waitFor(() => {
        expect(authApi.logout).toHaveBeenCalledTimes(1);
      });
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent("No user");
      });
    });
    it("logs out when refreshUser returns 403", async () => {
      authApi.getMe
        .mockResolvedValueOnce({
          user: mockUser,
        })
        .mockRejectedValueOnce({
          response: {
            status: 403,
          },
        });
      authApi.logout.mockResolvedValue({});
      renderAuth();
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(mockUser));
      });
      await expect(refreshUser()).rejects.toMatchObject({response: { status: 403 },});
      await waitFor(()=>{
        expect(authApi.logout).toHaveBeenCalledTimes(1);
      });
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent("No user");
      })
    });
    it("rethrows non-authentication errors", async()=>{
      const error = new Error("Refresh failed");

      authApi.getMe.mockResolvedValueOnce({user: mockUser, }).mockRejectedValueOnce(error);
      renderAuth();
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(mockUser));
      });
      await expect(refreshUser()).rejects.toThrow("Refresh failed");
      expect(authApi.getMe).toHaveBeenCalledTimes(2);
    });
  });
  describe("unauthorized event", () => {
    it("logs out when auth:unauthorized event is dispatched", async () => {
      authApi.getMe.mockResolvedValue({ user: mockUser,});
      authApi.logout.mockResolvedValue({});
      renderAuth();
      await waitFor(()=> {
        expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(mockUser));
      });
      window.dispatchEvent(new Event("auth:unauthorized"));
      await waitFor(() => {
        expect(authApi.logout).toHaveBeenCalledTimes(1);
      });
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent("No user");
      });
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });
    it("still clears the user when unauthorized logout fails", async () => {
      authApi.getMe.mockResolvedValue({
        user: mockUser,
      });
      authApi.logout.mockRejectedValue(new Error("Logout failed"));
      renderAuth();
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(mockUser));
      });
      window.dispatchEvent(new Event("auth:unauthorized"));
      await waitFor(()=>{
        expect(screen.getByTestId("user")).toHaveTextContent("No user");});
      expect(authApi.logout).toHaveBeenCalledTimes(1);
    });
  });
  describe("setUser", () => {
    it("exposes setUser through the context", async()=> {
      authApi.getMe.mockResolvedValue({ user: null,});
      renderAuth();
      await waitFor(()=>{
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
      fireEvent.click(screen.getByText("Set User"));
      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent(
          "Changed User"
        );
      });
    });
  });

  describe("useAuth", () => {
    it("throws an error when used outside AuthProvider", () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleError.mockRestore();
    });
  });

  describe("event listener cleanup", () => {
    it("removes the unauthorized event listener when unmounted", async () => {
      authApi.getMe.mockResolvedValue({
        user: mockUser,
      });

      authApi.logout.mockResolvedValue({});

      const { unmount } = renderAuth();

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent(
          JSON.stringify(mockUser)
        );
      });

      unmount();

      window.dispatchEvent(new Event("auth:unauthorized"));

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(authApi.logout).not.toHaveBeenCalled();
    });
  });
});