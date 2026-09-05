import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import NoteEditor from "../pages/NoteEditor";
const mockNavigate = jest.fn();
let mockParams = {};
let mockSearchParams = new URLSearchParams();
const mockSetSearchParams = jest.fn();
jest.mock("react-router-dom", () => ({
  NavLink:({children, className, to, ...props })=>{
    const resolvedClassName =typeof className === "function"? className({isActive:false}):className;
    return (
      <a href={typeof to=== "string" ? to : "#"}className={resolvedClassName}{...props}>{children}</a>
    );
  },
  useNavigate:()=>mockNavigate,
  useParams:()=>mockParams,
  useSearchParams:()=>[mockSearchParams,mockSetSearchParams,],
}));
const mockCreateNote = jest.fn();
const mockGetNote = jest.fn();
const mockUpdateNote = jest.fn();
jest.mock("../api/notes",()=>({
  createNote:(...args)=>mockCreateNote(...args),getNote:(...args)=>mockGetNote(...args),updateNote:(...args) =>mockUpdateNote(...args),
}));
const mockUpdateMe = jest.fn();
jest.mock("../api/auth",()=>({
  updateMe:(...args)=>mockUpdateMe(...args),
}));
const mockRefreshUser = jest.fn();
let mockUser= {categories: [],}
jest.mock("../context/AuthContext",()=>({
  useAuth:()=>({user: mockUser,refreshUser: (...args) => mockRefreshUser(...args),}),
}));
jest.mock("@tiptap/react", () => {
  const ReactActual = require("react");

  function extractText(html) {
    return String(html || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function makeChain() {
    const chain ={};
    const chainable=["focus","toggleBold","toggleItalic","toggleUnderline","toggleStrike","toggleCode","toggleBulletList","toggleOrderedList","toggleBlockquote","undo","redo","setLink","setImage",];
    chainable.forEach((name)=>{
      chain[name] = jest.fn((...args)=>chain);
    });
    chain.run = jest.fn(() => true);
    return chain;
  }
  const useEditor = jest.fn((options)=>{
    const [, forceRender] = ReactActual.useReducer((count)=>count+ 1,0);
    const stateRef = ReactActual.useRef(null);
    if(stateRef.current=== null){
      const initialHtml = options?.content ?? "<p></p>";
      stateRef.current = {html: initialHtml,text: extractText(initialHtml),};
    }
    const chainRef = ReactActual.useRef(null);
    if(chainRef.current === null){
      chainRef.current = makeChain();
    }
    const editorRef = ReactActual.useRef(null);
    if(editorRef.current===null){
      editorRef.current ={
        getText: () => stateRef.current.text,
        getHTML: () => stateRef.current.html,
        isActive: jest.fn(() => false),
        chain: jest.fn(()=>chainRef.current),
        commands: {setContent: jest.fn((content) => {stateRef.current.html= content;stateRef.current.text = extractText(content);forceRender(); }),},
      };
    }
    return editorRef.current;
  });
  const EditorContent =({editor})=>
    ReactActual.createElement("div",{"data-testid": "editor-content",},editor ? editor.getText() : "");
  return {useEditor,EditorContent,};
});
jest.mock("@tiptap/starter-kit",()=>({
  __esModule: true,default: {},
}));
jest.mock("@tiptap/extension-link",() =>({
  __esModule: true,default:{configure:jest.fn(()=>({})),},
}));
jest.mock("@tiptap/extension-image",() =>({
  __esModule: true,default: {},
}));
jest.mock("@tiptap/extension-underline",()=>({
  __esModule: true,default: {},
}));
const renderNoteEditor = () => render(<NoteEditor/>);
beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  mockSearchParams = new URLSearchParams();
  mockUser = {
    categories: ["Work", "Personal"],
  };
  mockGetNote.mockResolvedValue({note: {},});
  mockCreateNote.mockResolvedValue({});
  mockUpdateNote.mockResolvedValue({});
  mockUpdateMe.mockResolvedValue({});
  mockRefreshUser.mockResolvedValue({});
});
describe("NoteEditor — creating a new note", () => {
  test("renders the editor UI immediately (no loading state)", ()=>{
    renderNoteEditor();
    expect(screen.queryByText(/loading note/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/untitled note/i)).toBeInTheDocument();
    expect(screen.getByRole("button",{name:/save note/i,})).toBeInTheDocument();
    expect(screen.getByRole("button",{name:/cancel note/i,})).toBeInTheDocument();
  });
  test("defaults the category to 'No Category' when no query param is present",() =>{
    renderNoteEditor();
    expect(screen.getByLabelText(/category/i)).toHaveValue("");
  });
  test("lists the user's categories in the select", () =>{
    renderNoteEditor();
    expect(screen.getByRole("option",{name:"Work",})).toBeInTheDocument();
    expect(screen.getByRole("option",{name:"Personal",})).toBeInTheDocument();
    expect(screen.getByRole("option",{name:"+ New Category",})).toBeInTheDocument();
  });
  test("preselects the category matching a ?category= query param, case-insensitively",() =>{
    mockSearchParams = new URLSearchParams("category=work");
    renderNoteEditor();
    expect(screen.getByLabelText(/category/i)).toHaveValue("Work");
  });
  test("falls back to no category when the query param doesn't match any category",()=>{
    mockSearchParams = new URLSearchParams("category=doesnotexist");
    renderNoteEditor();
    expect(screen.getByLabelText(/category/i)).toHaveValue("");
  });
  test("lets the user type a title",async()=>{
    const user = userEvent;
    renderNoteEditor();
    const titleInput =screen.getByPlaceholderText(/untitled note/i);
    await user.type(titleInput,"My New Note");
    expect(titleInput).toHaveValue("My New Note");
  });
  test("toggles the favourite star", async()=>{
    const user =userEvent;
    renderNoteEditor();
    const favBtn =screen.getByRole("button",{name:/toggle favourite/i,});
    expect(favBtn).toHaveAttribute("aria-pressed","false");
    await user.click(favBtn);
    expect(favBtn).toHaveAttribute("aria-pressed","true");
    await user.click(favBtn);
    expect(favBtn).toHaveAttribute("aria-pressed","false");
  });
  test("clicking Cancel navigates back to /notes", async()=>{
    const user = userEvent;
    renderNoteEditor();
    await user.click(screen.getByRole("button",{name:/cancel note/i,})
    );
    expect(mockNavigate).toHaveBeenCalledWith("/notes");
  });
  test("clicking 'Back to all notes' navigates to /notes",async()=>{
    const user = userEvent;
    renderNoteEditor();
    await user.click(screen.getByRole("button",{name:/back to all notes/i,})
    );
    expect(mockNavigate).toHaveBeenCalledWith("/notes");
  });
  test("shows the initial word/character count for an empty note", () => {
    renderNoteEditor();
    expect(screen.getByText(/0 words • 0 characters/)).toBeInTheDocument();
  });
});
describe("NoteEditor — editing an existing note", ()=>{
  beforeEach(() =>{
    mockParams ={id: "note-1",};
  });
  test("shows a loading state while the note is being fetched",() => {
    mockGetNote.mockReturnValueOnce(
      new Promise(() => {})
    );
    renderNoteEditor();
    expect(screen.getByText(/loading note/i)).toBeInTheDocument();
  });
  test("fetches the note by id and populates the form", async () => {
    mockGetNote.mockResolvedValueOnce({
      note:{id:"note-1",title:"Existing Title",isFavourite:true,category:"Personal",content: "<p>Hello world</p>",},
    });
    renderNoteEditor();
    await waitFor(()=>
      expect(mockGetNote).toHaveBeenCalledWith("note-1")
    );
    expect(await screen.findByDisplayValue("Existing Title")).toBeInTheDocument();
    expect(screen.getByRole("button",{name:/toggle favourite/i,})).toHaveAttribute("aria-pressed","true");
    expect(screen.getByLabelText(/category/i)).toHaveValue("Personal");
  });
  test("shows an error when the note fails to load", async()=>{
    mockGetNote.mockRejectedValueOnce({
      response:{data:{message:"Note not found",},},});
    renderNoteEditor();
    expect(await screen.findByRole("alert")).toHaveTextContent( "Note not found");
  });
  test("shows a generic error when loading fails without a message",async()=>{
    mockGetNote.mockRejectedValueOnce(new Error("boom"));
    renderNoteEditor();
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load this note.");
  });
  test("does not apply the ?category= query param when editing an existing note", async() =>{
    mockSearchParams= new URLSearchParams("category=Work");
    mockGetNote.mockResolvedValueOnce({
      note:{id:"note-1",title: "T",isFavourite: false,category: "Personal",content: "<p></p>",},
    });
    renderNoteEditor();
    await screen.findByDisplayValue("T");
    expect(screen.getByLabelText(/category/i)).toHaveValue("Personal");
  });
});
describe("NoteEditor — creating a category", () => {
  test("opens the new category modal from the select", async () => {
    const user = userEvent;
    renderNoteEditor();
    await user.selectOptions(screen.getByLabelText(/category/i),"+ New Category");
    expect(screen.getByRole("heading",{name: /new category/i,})).toBeInTheDocument();
  });
  test("shows a validation error when submitting an empty category name", async()=> {
    const user= userEvent;
    renderNoteEditor();
    await user.selectOptions(screen.getByLabelText(/category/i),"+ New Category");
    await user.click(
      screen.getByRole("button", {name:/create category/i,}));
    expect(await screen.findByText(/category name is required/i)).toBeInTheDocument();
    expect(mockUpdateMe).not.toHaveBeenCalled();
  });
  test("reuses an existing category (case-insensitive) instead of creating a duplicate", async () => {
    const user = userEvent;
    renderNoteEditor();
    await user.selectOptions(screen.getByLabelText(/category/i),"+ New Category");
    await user.type(screen.getByLabelText(/category name/i),"work");
    await user.click(screen.getByRole("button",{name:/create category/i,}));
    expect(mockUpdateMe).not.toHaveBeenCalled();
    await waitFor(()=>
      expect(screen.queryByRole("heading", {name: /new category/i,})).not.toBeInTheDocument()
    );
    expect(screen.getByLabelText(/category/i)).toHaveValue("Work");
  });
  test("shows a server error message when category creation fails", async () => {
    mockUpdateMe.mockRejectedValueOnce({
      response: {
        data: {
          message: "Server exploded",
        },
      },
    });
    const user= userEvent;
    renderNoteEditor();
    await user.selectOptions(screen.getByLabelText(/category/i),"+ New Category");
    await user.type(screen.getByLabelText(/category name/i),"Travel");
    await user.click(screen.getByRole("button",{name:/create category/i,
      })
    );
    expect(await screen.findByText(/server exploded/i)).toBeInTheDocument();
  });
  test("closing the modal via Cancel discards the entered name", async () => {
    const user = userEvent;
    renderNoteEditor();
    await user.selectOptions(screen.getByLabelText(/category/i),"+ New Category");
    await user.type(screen.getByLabelText(/category name/i),"Draft");
    await user.click(screen.getAllByRole("button",{name: /^cancel$/i,})[0]);
    expect(screen.queryByRole("heading",{name: /new category/i,})).not.toBeInTheDocument();
  });
});
describe("NoteEditor — deleting a category", () => {
  test("opens a confirmation modal naming the category", async () => {
    const user = userEvent;
    renderNoteEditor();
    await user.click(
      screen.getByRole("button",{name: "Delete Work",})
    );
    expect(
      screen.getByRole("heading",{name: /delete category\?/i,})).toBeInTheDocument();
    expect(screen.getByText(/"Work"/)).toBeInTheDocument();
  });
  test("confirming deletion persists the updated category list", async ()=>{
    const user = userEvent;
    renderNoteEditor();
    await user.click(screen.getByRole("button",{name:"Delete Work",}));
    await user.click(
      screen.getByRole("button",{name: /^delete category$/i,})
    );
    await waitFor(()=>
      expect(mockUpdateMe).toHaveBeenCalledWith({categories:["Personal"],})
    );
    expect(mockRefreshUser).toHaveBeenCalled();
    await waitFor(()=>
      expect(screen.queryByRole("heading", {name: /delete category\?/i,})).not.toBeInTheDocument()
    );
  });
  test("clears the selected category on the new note form if it matches the deleted one", async () => {
    const user = userEvent;
    renderNoteEditor();
    await user.selectOptions(screen.getByLabelText(/category/i),"Work");
    await user.click(screen.getByRole("button",{name:"Delete Work",}));
    await user.click(screen.getByRole("button",{name:/^delete category$/i,}));
    await waitFor(() =>expect( mockUpdateMe).toHaveBeenCalled());
    expect(screen.getByLabelText(/category/i)).toHaveValue("");
  });
  test("clears and persists the note's category when the deleted category was assigned to it", async () => {
    mockParams = {id: "note-1",};
    mockGetNote.mockResolvedValueOnce({
      note:{id:"note-1",title:"T",isFavourite:false,category:"Work",content:"<p></p>",},
    });
    const user = userEvent;
    renderNoteEditor();
    await screen.findByDisplayValue("T");
    await user.click(screen.getByRole("button",{name:"Delete Work",}));
    await user.click(screen.getByRole("button",{name:/^delete category$/i, }));
    await waitFor(()=>
      expect(mockUpdateNote).toHaveBeenCalledWith("note-1",{category: null,})
    );
    expect(screen.getByLabelText(/category/i)).toHaveValue("");
  });
  test("shows an error message when deletion fails",async()=>{
    mockUpdateMe.mockRejectedValueOnce({
      response:{data:{message: "Cannot delete",},},
    });
    const user = userEvent;
    renderNoteEditor();
    await user.click(screen.getByRole("button",{name: "Delete Work",}));
    await user.click(screen.getByRole("button",{name: /^delete category$/i,}));
    expect(await screen.findByRole("alert")).toHaveTextContent("Cannot delete");
  });
  test("canceling the confirmation leaves categories untouched", async() => {
    const user = userEvent;
    renderNoteEditor();
    await user.click(screen.getByRole("button",{name:"Delete Work",}));
    await user.click(screen.getAllByRole("button",{name:/^cancel$/i,})[0]);
    expect(screen.queryByRole("heading",{name:/delete category\?/i,})).not.toBeInTheDocument();
    expect(mockUpdateMe).not.toHaveBeenCalled();
  });
});
describe("NoteEditor — formatting toolbar", () => {
  test("clicking Bold, Italic, Underline, Strike and Code does not throw", async () => {
    const user = userEvent;
    renderNoteEditor();
    for(const label of ["Bold","Italic","Underline","Strike","Code",]) {
      await user.click(screen.getByRole("button",{name:label,}));
    }
    expect(screen.getByRole("button",{name:"Bold",})).toBeInTheDocument();
  });
  test("clicking Bullet List, Numbered List and Quote does not throw", async () => {
    const user = userEvent;
    renderNoteEditor();
    for(const label of ["Bullet List","Numbered List","Quote",]) {
      await user.click(screen.getByRole("button",{name:label,}));
    }
    expect(screen.getByRole("button",{name:"Quote",})).toBeInTheDocument();
  });
  test("clicking Undo and Redo does not throw", async () =>{
    const user =userEvent;
    renderNoteEditor();
    await user.click(screen.getByRole("button",{name:"Undo",}));
    await user.click(screen.getByRole("button", {name: "Redo",}));
    expect(screen.getByRole("button",{name:"Redo",})).toBeInTheDocument();
  });
});
describe("NoteEditor — misc", () => {
  test("handles a user with no categories gracefully", () => {
    mockUser ={categories: undefined,};
    renderNoteEditor();
    expect(screen.getByLabelText(/category/i)).toHaveValue("");
    expect(screen.queryByRole("option",{name: "Work",})).not.toBeInTheDocument();
  });
  test("selecting 'No Category' clears the category", async ()=> {
    const user= userEvent;
    renderNoteEditor();
    await user.selectOptions(screen.getByLabelText(/category/i),"Work");
    expect(screen.getByLabelText(/category/i)).toHaveValue("Work");
    await user.selectOptions(screen.getByLabelText(/category/i),"No Category");
    expect(screen.getByLabelText(/category/i)).toHaveValue("");
  });
});