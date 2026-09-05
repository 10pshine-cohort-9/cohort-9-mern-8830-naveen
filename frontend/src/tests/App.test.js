import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
jest.mock("../context/AuthContext", () => ({
  AuthProvider:({children})=>(
    <div data-testid="auth-provider">{children}</div> ),}));
jest.mock("../components/ProtectedRoute",()=>({
  __esModule: true,default: ({ children }) => (<div data-testid="protected-route">{children}</div>),
}));
jest.mock("../pages/Login",()=>({
  __esModule: true,default: () => <div>Login Page</div>,}));

jest.mock("../pages/Signup",()=>({
  __esModule: true,default: () => <div>Signup Page</div>,}));
jest.mock("../pages/Dashboard",()=>({
  __esModule: true,default: () => <div>Dashboard Page</div>,}));
jest.mock("../pages/NoteEditor", () => ({
  __esModule: true,default: () => <div>Note Editor Page</div>,}));

jest.mock("../pages/Profile",()=>({
  __esModule: true,default:()=><div>Profile Page</div>,}));

jest.mock("../pages/ChangePassword",()=>({
  __esModule: true,default:()=><div>Change Password Page</div>,}));

jest.mock("../pages/ForgotPassword",()=>({
  __esModule: true,default:()=><div>Forgot Password Page</div>,}));

jest.mock("../pages/ResetPassword",()=>({
  __esModule: true,default:()=><div>Reset Password Page</div>,
}));

jest.mock("../pages/NotFound",()=>({
  __esModule: true,default:()=><div>Not Found Page</div>,
}));

const renderAt=(path)=>{
  return render(
    <MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);};

describe("App routes", () => {
  test("renders Login at /",()=>{
    renderAt("/");
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("renders Login at /login",()=>{
    renderAt("/login");
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("renders Signup at /signup",()=>{
    renderAt("/signup");
    expect(screen.getByText("Signup Page")).toBeInTheDocument();
  });

  test("renders Forgot Password at /forgot-password",()=>{
    renderAt("/forgot-password");
    expect(screen.getByText("Forgot Password Page")).toBeInTheDocument();
  });

  test("renders Reset Password at /reset-password", () => {
    renderAt("/reset-password");
    expect(screen.getByText("Reset Password Page")).toBeInTheDocument();
  });

  test("renders Dashboard at /notes", () => {
    renderAt("/notes");
    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  test("renders NoteEditor at /editor", () => {
    renderAt("/editor");
    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    expect(screen.getByText("Note Editor Page")).toBeInTheDocument();
  });

  test("renders NoteEditor at /editor/:id", () => {
    renderAt("/editor/123");
    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    expect(screen.getByText("Note Editor Page")).toBeInTheDocument();
  });

  test("renders Profile at /profile", () => {
    renderAt("/profile");
    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    expect(screen.getByText("Profile Page")).toBeInTheDocument();
  });

  test("renders Change Password at /change-password", () => {
    renderAt("/change-password");
    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    expect( screen.getByText("Change Password Page")).toBeInTheDocument();
  });

  test("renders NotFound for unknown route", () => {
    renderAt("/some-invalid-route");
    expect(screen.getByText("Not Found Page")).toBeInTheDocument();
  });
});