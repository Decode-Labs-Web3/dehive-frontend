"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faFolder, faX } from "@fortawesome/free-solid-svg-icons";

interface CategoryProps {
  _id: string;
  name: string;
  server_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  channels: ChannelProps[];
}

interface ChannelProps {
  _id: string;
  name: string;
  type: string;
  category_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CategoryPanel {
  category: CategoryProps;
  setEditCategoryModal: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  handleDeleteCategory: (categoryId: string) => void;
  fetchCategoryInfo: () => void;
}

export default function CategoryPanel({
  category,
  setEditCategoryModal,
  handleDeleteCategory,
  fetchCategoryInfo,
}: CategoryPanel) {
  const allFalse = { overview: false, permissions: false };
  const [editCategoryForm, setEditCategoryForm] = useState({
    name: category.name,
  });
  const [tabOption, setTabOption] = useState({ ...allFalse, overview: true });
  const [deleteCategoryModal, setDeleteCategoryModal] = useState(false);

  const handleEditCategoryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditCategoryForm({ name: event.target.value });
  };

  const categoryNameChange = editCategoryForm.name !== category.name;
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (categoryNameChange) return;
      if (e.key !== "Escape") return;
      if (deleteCategoryModal) {
        e.preventDefault();
        setDeleteCategoryModal(false);
        return;
      }
      setEditCategoryModal((prev) => ({ ...prev, [category._id]: false }));
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [
    deleteCategoryModal,
    category._id,
    setEditCategoryModal,
    categoryNameChange,
  ]);

  const handleEditCategory = async (categoryId: string) => {
    try {
      const apiResponse = await fetch("/api/servers/category/patch", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          categoryId,
          name: editCategoryForm.name,
        }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        console.error(apiResponse);
        return;
      }

      const response = await apiResponse.json();
      if (
        response.statusCode === 200 &&
        response.message === "Operation successful"
      ) {
        fetchCategoryInfo?.();
        setEditCategoryModal((prev) => ({
          ...prev,
          [categoryId]: true,
        }));
      }
    } catch (error) {
      console.error(error);
      console.log("Server edit category error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="flex relative h-screen">
        <div className="flex w-100 bg-green-500">
          <div className="flex flex-col items-end justify-start w-full gap-3 p-4">
            <h1 className="flex mt-10 justify-start items-center font-bold gap-2 w-50">
              <FontAwesomeIcon icon={faFolder} />
              {editCategoryForm.name.toUpperCase()}
            </h1>
            <button
              onClick={() => {
                setTabOption({
                  ...allFalse,
                  overview: true,
                });
              }}
              className="flex justify-start items-center font-bold rounded-md p-2 hover:bg-gray-400 w-50"
            >
              Overview
            </button>
            <button
              onClick={() => {
                setTabOption({
                  ...allFalse,
                  permissions: true,
                });
              }}
              className="flex justify-start items-center font-bold rounded-md p-2 hover:bg-gray-400 w-50"
            >
              Permissions
            </button>
            <div className="h-px w-50 rounded bg-[var(--border-color)]" />
            <button
              onClick={() => {
                setDeleteCategoryModal(true);
              }}
              className="flex justify-between items-center text-red-500 font-bold rounded-md p-2 hover:bg-gray-400 w-50"
            >
              Delete category
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-blue-500">
          <div className="flex justify-between px-20 mt-10">
            {/* Overview */}
            {tabOption.overview && (
              <div className="flex flex-col">
                <h1>Overview</h1>
                <label htmlFor="name">Category Name</label>
                <input
                  id="name"
                  name="name"
                  value={editCategoryForm.name}
                  onChange={handleEditCategoryChange}
                  autoFocus
                />
              </div>
            )}
            {tabOption.permissions && <h1>Hello Permissions</h1>}
            <button
              // tabIndex={-1}
              // ref={(element: HTMLButtonElement) => {
              //   element?.focus();
              // }}
              disabled={categoryNameChange}
              onClick={() => {
                if (categoryNameChange) return;
                setEditCategoryModal((prev) => ({
                  ...prev,
                  [category._id]: false,
                }));
              }}
              className="flex flex-col"
            >
              <FontAwesomeIcon className="border rounded-full p-2" icon={faX} />
              ESC
            </button>

            {categoryNameChange && (
              <div className="fixed inset-z-0 bottom-0 bg-red-500 w-200 h-10 m-10">
                <div className="flex flex-row justify-between items-center">
                  <h1>Careful - you have unsaved changes!</h1>
                  <div className="flex flex-row gap-2 items-center">
                    <button
                      onClick={() => {
                        setEditCategoryForm({ name: category.name });
                      }}
                    >
                      Reset
                    </button>
                    <button onClick={() => handleEditCategory(category._id)}>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {deleteCategoryModal && (
              <div
                role="dialog"
                className="fixed inset-0 flex items-center justify-center z-30"
              >
                <div
                  onClick={() => {
                    setDeleteCategoryModal(false);
                  }}
                  className="fixed inset-0 bg-black/50 z-40"
                />

                <div className="bg-[var(--background)] text-[var(--foreground)] rounded-lg p-5 w-full max-w-md z-50 shadow-2xl border border-[var(--border-color)]">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold">Delete Category</h3>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">
                        Are you sure you want to delete{" "}
                        <span className="font-bold">{category.name}</span>? This
                        action {"can't"} be undone.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row justify-end gap-3 mt-5">
                    <button
                      onClick={() => {
                        setDeleteCategoryModal(false);
                      }}
                      className="px-3 py-2 rounded-md text-sm bg-[var(--background-secondary)] text-[var(--foreground)] hover:opacity-90"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteCategory(category._id);
                      }}
                      className="px-3 py-2 rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
