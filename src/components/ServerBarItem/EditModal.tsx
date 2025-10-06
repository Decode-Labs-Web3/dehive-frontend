"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faPen,
  faTrash,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

interface ServerProps {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  member_count: number;
  is_private: boolean;
  tags: [];
  createdAt: string;
  updatedAt: string;
  _v: boolean;
}

export default function EditModal({ server }: { server: ServerProps }) {
  const [modal, setModal] = useState({
    edit: false,
    delete: false,
    leave: false,
  });
  const [serverEditForm, setServerEditForm] = useState({
    name: server.name,
    description: server.description,
  });
  const [serverDeleteForm, setServerDeleteFrom] = useState({
    name: "",
  });

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerEditForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleDeleteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerDeleteFrom(() => ({
      [event.target.name]: event.target.value,
    }));
  };

  const handleEditServer = () => {
    console.log("edit server");
  };

  const handleDeleteServer = () => {
    console.log("Delete server");
  };

  const handleLeaveServer = () => {
    console.log("Leave server");
  };

  return (
    <>
      <div
        role="dialog"
        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-55 z-10 rounded bg-white text-black"
      >
        <button className="w-full p-2 text-[var-(--foreground)] bg-gray-500 flex justify-between hover:border-2 hover:border-[var-(--foreground)]">
          Invite Friend
          <FontAwesomeIcon icon={faUserPlus} />
        </button>

        <button
          onClick={() => setModal((prev) => ({ ...prev, leave: true }))}
          className="w-full p-2 text-[var-(--foreground)] bg-gray-500 flex justify-between hover:border-2 hover:border-[var-(--foreground)]"
        >
          Leave Server
          <FontAwesomeIcon icon={faRightFromBracket} />
        </button>

        <button
          onClick={() => setModal((prev) => ({ ...prev, edit: true }))}
          className="w-full p-2 text-[var-(--foreground)] bg-gray-500 flex justify-between hover:border-2 hover:border-[var-(--foreground)]"
        >
          Edit Server
          <FontAwesomeIcon icon={faPen} />
        </button>

        <button
          onClick={() => setModal((prev) => ({ ...prev, delete: true }))}
          className="w-full p-2 text-[var-(--foreground)] bg-gray-500 flex justify-between hover:border-2 hover:border-[var-(--foreground)]"
        >
          Delete Server
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
      {modal.edit && (
        <div
          role="dialog"
          className="fixed inset-0 flex items-center justify-center z-20"
        >
          <div
            onClick={() => setModal((prev) => ({ ...prev, edit: false }))}
            className="absolute inset-0 bg-black/50 z-30"
          />
          <div className="relative w-full max-w-sm rounded-lg bg-white text-gray-900 border p-4 z-40">
            <h1 className="text-lg font-semibold mb-4">Edit your server</h1>

            <label htmlFor="name" className="text-sm mb-1 block">
              Server name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={serverEditForm.name}
              onChange={handleEditChange}
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
              value={serverEditForm.description}
              onChange={handleEditChange}
              className="w-full border rounded p-2 mb-4"
              placeholder="Write your description"
              required
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal((prev) => ({ ...prev, edit: false }))}
                className="border rounded px-3 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleEditServer}
                disabled={
                  serverEditForm.name.trim() === "" ||
                  serverEditForm.description.trim() === ""
                }
                className={`bg-blue-600 text-white rounded px-4 py-2 ${
                  serverEditForm.name.trim() === "" &&
                  serverEditForm.description.trim() === "" &&
                  "cursor-not-allowed"
                }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.delete && (
        <div
          role="dialog"
          className="fixed inset-0 flex items-center justify-center z-20"
        >
          <div
            onClick={() => setModal((prev) => ({ ...prev, delete: false }))}
            className="absolute inset-0 bg-black/50 z-30"
          />
          <div className="w-50 h-50 bg-white z-40">
            <h1>Delete Server</h1>
            <label htmlFor="name">
              Please type the retype the name of {server.name}
            </label>
            <input
              id="name"
              name="name"
              value={serverDeleteForm.name}
              onChange={handleDeleteChange}
            />

            <div className="flex flex-row justify-end gap-2">
              <button
                onClick={() =>
                  setModal((prev) => ({
                    ...prev,
                    delete: false,
                  }))
                }
              >
                Cancel
              </button>
              <button>Delete</button>
            </div>
          </div>
        </div>
      )}

      {modal.leave && (
        <div
          role="dialog"
          className="fixed inset-0 flex items-center justify-center z-20"
        >
          <div
          onClick={() => setModal(prev => ({ ...prev, leave: false}))}
          className="absolute inset-0 bg-black/50 z-30" />
          <div className="bg-white w-100 z-40">
            <h1>Leave {server.name}</h1>
            <p>
              Are you sure you want to leave {server.name}? You {"won't"} be able to
              rejoin this server unless you are re-invited.
            </p>
            <div className="flex flex-row justify-end gap-2">
              <button
                onClick={() => setModal((prev) => ({ ...prev, leave: false }))}
              >
                Cancel
              </button>
              <button>Leave</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
