import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NoteCard from "../components/NoteCard";
const baseNote={id: 1,title: "Project Ideas",content: "Some fresh ideas for upcoming projects and features",category: "Work", isFavourite: false,updatedAt: "2024-05-19T00:00:00.000Z",};
const renderNoteCard=(overrides={},props= {})=>{
  const note={ ...baseNote, ...overrides};
  const defaultProps={note,onOpen: jest.fn(),onToggleFavourite: jest.fn(),onArchive: jest.fn(),onDelete: jest.fn(),onRestore: jest.fn(),onDeleteForever: jest.fn(),activeMenu: null,setActiveMenu: jest.fn(),};
  return {
    ...render(<NoteCard {...defaultProps} {...props} />),note,...defaultProps,...props,
  };
};
describe("NoteCard",()=>{
  describe("Rendering",()=>{
    it("renders the note title and content preview",()=>{
      renderNoteCard();
      expect(screen.getByText("Project Ideas")).toBeInTheDocument();
      expect(screen.getByText(/Some fresh ideas for upcoming projects/)).toBeInTheDocument();
    });
    it("renders the formatted updated date",()=>{
      renderNoteCard();
      expect(screen.getByText("May 19, 2024")).toBeInTheDocument();
    });
    it.each([["Personal", "bg-orange-300"],["Work", "bg-blue-300"],["Ideas", "bg-green-300"],["Study", "bg-purple-300"],["Other", "bg-gray-300"],])("renders the correct category dot for %s", (category, expectedClass) => {
      const { container } = renderNoteCard({ category });
      const dot = container.querySelector(`.${expectedClass}`);
      expect(dot).toBeInTheDocument();
    });
    it("uses the Other category dot for an unknown category", () => {
      const {container}=renderNoteCard({category: "Unknown Category",});
      expect(container.querySelector(".bg-gray-300")).toBeInTheDocument();
    });
    it("renders the fallback when content is empty",()=>{
      renderNoteCard({content:""});
      expect(screen.getByText("No additional content yet.")).toBeInTheDocument();
    });
    it("renders the fallback when content is undefined",()=>{
      renderNoteCard({content:undefined});
      expect(screen.getByText("No additional content yet.")).toBeInTheDocument();
    });
    it("strips HTML tags from the content preview",() =>{
      renderNoteCard({content:"<p>Hello <strong>world</strong></p>",});
      expect(screen.getByText("Hello world")).toBeInTheDocument();
      expect(screen.queryByText("<p>Hello")).not.toBeInTheDocument();
    });
    it("renders the favourite button as not pressed when note is not favourite",()=>{
      renderNoteCard({ isFavourite: false });
      expect(screen.getByLabelText("Toggle Favourite")).toHaveAttribute("aria-pressed","false");
    });
    it("renders the favourite button as pressed when note is favourite",()=>{
      renderNoteCard({ isFavourite: true });
      expect(screen.getByLabelText("Toggle Favourite")).toHaveAttribute("aria-pressed","true");
    });
  });
  describe("Opening a note",()=>{
    it("calls onOpen when the title is clicked",()=>{
      const onOpen =jest.fn();
      renderNoteCard({},{onOpen});
      fireEvent.click(screen.getByText("Project Ideas"));
      expect(onOpen).toHaveBeenCalledTimes(1);
      expect(onOpen).toHaveBeenCalledWith(baseNote);
    });
    it("calls onOpen when the content preview is clicked",()=>{
      const onOpen= jest.fn();
      renderNoteCard({},{onOpen});
      fireEvent.click(screen.getByText(/Some fresh ideas for upcoming projects/));
      expect(onOpen).toHaveBeenCalledTimes(1);
      expect(onOpen).toHaveBeenCalledWith(baseNote);
    });
    it("does not throw when onOpen is not provided", () => {
      expect(()=>{render(<NoteCard note={baseNote} onToggleFavourite={jest.fn()}/>);}).not.toThrow();
      expect(() => {
        fireEvent.click(screen.getByText("Project Ideas"));
      }).not.toThrow();
    });
  });
  describe("Favourite",() =>{
    it("calls onToggleFavourite with the note",() =>{
      const onToggleFavourite = jest.fn();
      renderNoteCard({}, {onToggleFavourite});
      fireEvent.click(screen.getByLabelText("Toggle Favourite"));
      expect(onToggleFavourite).toHaveBeenCalledTimes(1);
      expect(onToggleFavourite).toHaveBeenCalledWith(baseNote);
    });
    it("does not call onOpen when favourite is clicked",()=>{
      const onOpen = jest.fn();
      const onToggleFavourite = jest.fn();
      renderNoteCard({},{onOpen,onToggleFavourite,});
      fireEvent.click(screen.getByLabelText("Toggle Favourite"));
      expect(onToggleFavourite).toHaveBeenCalledWith(baseNote);
      expect(onOpen).not.toHaveBeenCalled();
    });
    it("works when onToggleFavourite is not provided", () =>{
      expect(() =>{
        render(<NoteCard note={baseNote} onOpen={jest.fn()} />);
        fireEvent.click(screen.getByLabelText("Toggle Favourite"));
      }).not.toThrow();
    });
  });
  describe("More options menu", () => {
    it("opens the menu when More options is clicked",()=>{
      const setActiveMenu=jest.fn();
      renderNoteCard(
        {},
        {activeMenu: null,setActiveMenu,}
      );
      fireEvent.click(screen.getByLabelText("More options"));
      expect(setActiveMenu).toHaveBeenCalledWith(baseNote.id);
    });
    it("closes the menu when More options is clicked while it is active", ()=>{
      const setActiveMenu = jest.fn();
      renderNoteCard(
        {},{activeMenu: baseNote.id,setActiveMenu,}
      );
      fireEvent.click(screen.getByLabelText("More options"));
      expect(setActiveMenu).toHaveBeenCalledWith(null);
    });
    it("renders Archive when a normal note is not archived",()=>{
      renderNoteCard({isArchived: false,isDeleted: false,},{activeMenu: baseNote.id,});
      expect(screen.getByText("Archive")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
    it("renders Unarchive when a note is already archived", () =>{
      renderNoteCard({isArchived: true,isDeleted: false,},{activeMenu: baseNote.id,});
      expect(screen.getByText("Unarchive")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
    it("renders Restore and Delete Forever for deleted notes",()=>{
      renderNoteCard({isDeleted: true,},{activeMenu: baseNote.id,});
      expect(screen.getByText("Restore")).toBeInTheDocument();
      expect(screen.getByText("Delete Forever")).toBeInTheDocument();
      expect(screen.queryByText("Archive")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });
    it("does not render the menu when activeMenu does not match note id",()=>{
      renderNoteCard({},{activeMenu: 999,});
      expect(screen.queryByText("Archive")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
      expect(screen.queryByText("Restore")).not.toBeInTheDocument();
    });
  });
  describe("Archive",()=>{
    it("calls onArchive and closes the menu",()=>{
      const onArchive = jest.fn();
      const setActiveMenu = jest.fn();
      renderNoteCard(
        {isArchived: false,isDeleted: false,},
        {activeMenu: baseNote.id,onArchive,setActiveMenu,}
      );
      fireEvent.click(screen.getByText("Archive"));
      expect(onArchive).toHaveBeenCalledTimes(1);
      expect(onArchive).toHaveBeenCalledWith(baseNote.id);
      expect(setActiveMenu).toHaveBeenCalledWith(null);
    });
    it("calls onArchive for an archived note when Unarchive is clicked", () => {
      const onArchive = jest.fn();
      const setActiveMenu = jest.fn();
      renderNoteCard(
        {isArchived: true,isDeleted: false,},
        {activeMenu: baseNote.id,onArchive,setActiveMenu,}
      );
      fireEvent.click(screen.getByText("Unarchive"));
      expect(onArchive).toHaveBeenCalledWith(baseNote.id);
      expect(setActiveMenu).toHaveBeenCalledWith(null);
    });
    it("works when onArchive is not provided",()=>{
      expect(()=>{
        render(
          <NoteCard note={baseNote}activeMenu={baseNote.id}setActiveMenu={jest.fn()} />
        );
        fireEvent.click(screen.getByText("Archive"));
      }).not.toThrow();
    });
  });
  describe("Delete",()=>{
    it("calls onDelete and closes the menu",() =>{
      const onDelete = jest.fn();
      const setActiveMenu = jest.fn();
      renderNoteCard(
        {isDeleted: false,},
        {activeMenu: baseNote.id,onDelete,setActiveMenu,}
      );
      fireEvent.click(screen.getByText("Delete"));
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(baseNote.id);
      expect(setActiveMenu).toHaveBeenCalledWith(null);
    });
    it("works when onDelete is not provided",() =>{
      expect(()=> {
        render(<NoteCard note={baseNote}activeMenu={baseNote.id}setActiveMenu={jest.fn()}/>
        );
        fireEvent.click(screen.getByText("Delete"));
      }).not.toThrow();
    });
  });
  describe("Deleted notes", () => {
    it("calls onRestore and closes the menu", () => {
      const onRestore = jest.fn();
      const setActiveMenu = jest.fn();
      renderNoteCard(
        {isDeleted: true,},
        {activeMenu: baseNote.id,onRestore,setActiveMenu,}
      );
      fireEvent.click(screen.getByText("Restore"));
      expect(onRestore).toHaveBeenCalledTimes(1);
      expect(onRestore).toHaveBeenCalledWith(baseNote.id);
      expect(setActiveMenu).toHaveBeenCalledWith(null);
    });
    it("calls onDeleteForever and closes the menu", ()=>{
      const onDeleteForever = jest.fn();
      const setActiveMenu = jest.fn();
      renderNoteCard(
        {isDeleted: true,},
        {activeMenu: baseNote.id,onDeleteForever,setActiveMenu,}
      );
      fireEvent.click(screen.getByText("Delete Forever"));
      expect(onDeleteForever).toHaveBeenCalledTimes(1);
      expect(onDeleteForever).toHaveBeenCalledWith(baseNote.id);
      expect(setActiveMenu).toHaveBeenCalledWith(null);
    });
    it("works when onRestore is not provided", () =>{
      expect(()=> {
        render(
          <NoteCard note={{ ...baseNote, isDeleted: true }}activeMenu={baseNote.id}setActiveMenu={jest.fn()}/>
        );
        fireEvent.click(screen.getByText("Restore"));
      }).not.toThrow();
    });
    it("works when onDeleteForever is not provided",() => {
      expect(()=>{
        render(<NoteCard note={{ ...baseNote, isDeleted: true }}activeMenu={baseNote.id}setActiveMenu={jest.fn()}/>);
        fireEvent.click(screen.getByText("Delete Forever"));
      }).not.toThrow();
    });
  });
  describe("Event propagation", () =>{
    it("does not open the note when More options is clicked",()=>{
      const onOpen = jest.fn();
      const setActiveMenu = jest.fn();
      renderNoteCard( {}, {onOpen,activeMenu: null,setActiveMenu,});
      fireEvent.click(screen.getByLabelText("More options"));
      expect(onOpen).not.toHaveBeenCalled();
      expect(setActiveMenu).toHaveBeenCalledWith(baseNote.id);
    });
  });
});