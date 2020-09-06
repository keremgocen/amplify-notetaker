import React, { useState, useEffect } from "react";
// import logo from "./logo.svg";
import "./App.css";
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";

function App() {
  const [selectedNote, setNote] = useState("");
  const [stateId, setStateId] = useState();
  const [notes, setNotes] = useState([
    {
      id: 1,
      note: "hello naber",
    },
  ]);

  useEffect(() => {
    async function fetchData() {
      const result = await API.graphql(graphqlOperation(listNotes));
      setNotes([...result.data.listNotes.items]);
    }
    fetchData();
  }, []);

  const handleChangeNote = (event) => {
    event.preventDefault();
    setNote(event.target.value);
    if(event.target.value === '') {
      setStateId(null);
    }
  };

  const handleDeleteNote = async (id) => {
    const input = { id };
    const result = await API.graphql(graphqlOperation(deleteNote, { input }));
    const deletedNoteId = result.data.deleteNote.id;
    setNotes(notes.filter((note) => note.id !== deletedNoteId));
  };

  const handleSetNote = ({ note, id }) => {
    setNote(note);
    setStateId(id);
  };

  const hasExistingNote = () => {
    if (!!stateId) {
      return notes.findIndex((x) => x.id === stateId) > -1;
    }
    return false;
  };

  const updateGraphQLNote = async () => {
    const input = {
      id: stateId,
      note: selectedNote,
    };
    const result = await API.graphql(graphqlOperation(updateNote, { input }));
    const updated = result.data.updateNote;
    const index = notes.findIndex((x) => x.id === updated.id);
    setNotes([...notes.slice(0, index), updated, ...notes.slice(index + 1)]);
    setNote("");
    setStateId(null);
  };

  const handleAddNote = async (event) => {
    event.preventDefault();
    // check if we have an existing note, if so update it
    if (hasExistingNote()) {
      updateGraphQLNote();
    } else {
      const input = {
        note: selectedNote,
      };
      const result = await API.graphql(graphqlOperation(createNote, { input }));
      const newNote = result.data.createNote;
      setNotes([newNote, ...notes]);
    }
    setNote("");
    setStateId(null);
  };

  return (
    <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
      <h1 className="code f2-l">Amplify Notetaker</h1>
      {/* { note form } */}
      <form className="mb3" onSubmit={handleAddNote}>
        <input
          type="text"
          className="pa2 f4"
          placeholder="Write your note"
          onChange={handleChangeNote}
          value={selectedNote}
        />
        <button className="pa2 f4" type="submit">
          {stateId ? "Update" : "Add"}
        </button>
      </form>

      {/* Notes list */}
      <div>
        {notes.map((item) => (
          <div key={item.id} className="flex items-center">
            <li onClick={() => handleSetNote(item)} className="list pa1 f3">
              {item.note}
            </li>
            <button
              className="bg-transparent bn f4"
              onClick={() => handleDeleteNote(item.id)}
            >
              <span>&times;</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
