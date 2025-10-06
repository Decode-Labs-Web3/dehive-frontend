"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faPen,
  faTrash,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function EditModal() {
  const [editServerModal, setEditServerModal] = useState(false);
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

  const handleEditServer = () => {
    console.log("edit server");
  };

  return (
    <>
      <div
        role="dialog"
        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-55 z-50 rounded bg-white text-black"
      >
        <button className="w-full p-2 text-[var-(--foreground)] bg-gray-500 flex justify-between">
          Invite Friend
          <FontAwesomeIcon icon={faUserPlus} />
        </button>

        <button
          onClick={() => setEditServerModal(true)}
          className="w-full p-2 text-[var-(--foreground)] bg-gray-500 flex justify-between"
        >
          Edit Server
          <FontAwesomeIcon icon={faPen} />
        </button>

        <button className="w-full p-2 text-[var-(--foreground)] bg-gray-500 flex justify-between">
          Leave Server
          <FontAwesomeIcon icon={faRightFromBracket} />
        </button>

        <button className="w-full p-2 text-[var-(--foreground)] bg-gray-500 flex justify-between">
          Delete Server
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
      {editServerModal && (
        <div
          role="dialog"
          onClick={() => setEditServerModal(false)}
          className="fixed inset-0 flex items-center justify-center"
        >
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
                onClick={() => setEditServerModal(false)}
                className="border rounded px-3 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleEditServer}
                disabled={
                  serverForm.name.trim() === "" ||
                  serverForm.description.trim() === ""
                }
                className={`bg-blue-600 text-white rounded px-4 py-2 ${
                  serverForm.name.trim() === "" &&
                  serverForm.description.trim() === "" &&
                  "cursor-not-allowed"
                }`}
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
