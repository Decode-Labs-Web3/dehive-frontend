"use client";

import { useState } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function AddServer() {
  const [modelOpen, setModelOpen] = useState(false);

  const [serverForm, setServerForm] = useState({
    name: "",
    description: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCreateServer = () => {
    console.log(serverForm);
    try{

    } catch {

    } finally {

    }
  };

  return (
    <>
      <div className="relative group w-10 h-10 bg-blue-500 rounded-xl">
        <button
          onClick={() => {
            setModelOpen(true);
          }}
          className="w-full h-full"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <div className="z-10 absolute ml-2 top-1/2 -translate-y-1/2 p-2 left-full rounded-sm bg-black text-white opacity-0 group-hover:opacity-100 whitespace-nowrap">
          Add Server
        </div>
      </div>
      {modelOpen && (
        <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setModelOpen(false)}
        />

        <div className="relative z-10 w-full max-w-sm rounded-lg bg-white text-gray-900 border p-4">
          <h1 className="text-lg font-semibold mb-4">Create your server</h1>

          <label htmlFor="name" className="text-sm mb-1 block">
            Server name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={serverForm.name}
            onChange={handleChange}
            className="w-full border rounded p-2 mb-3"
            placeholder="Write your title"
            required
          />

          <label htmlFor="description" className="text-sm mb-1 block">
            Server description
          </label>
          <input
            id="description"
            name="description"
            type="text"
            value={serverForm.description}
            onChange={handleChange}
            className="w-full border rounded p-2 mb-4"
            placeholder="Write your description"
            required
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModelOpen(false)}
              className="border rounded px-3 py-2"
            >
              Cancel
            </button>

            <button
              onClick={handleCreateServer}
              className="bg-blue-600 text-white rounded px-4 py-2"
            >
              Create
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  );
}
