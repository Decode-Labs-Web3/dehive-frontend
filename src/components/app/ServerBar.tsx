"use client";

import { useState } from "react";
import ServerBarItems from "@/components/server-bar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useServerInfomation } from "@/hooks/useServerInfomation";
import { faX, faChevronDown } from "@fortawesome/free-solid-svg-icons";

export default function ServerBar() {
  const { serverInfomation } = useServerInfomation();
  const [serverPanel, setServerPanel] = useState(false);
  const [serverSettingModal, setServerSettingModal] = useState(false);
  return (
    <div className="w-full h-full bg-background border border-border">
      <div className="relative bg-secondary border border-border p-2 font-bold z-20">
        <button
          onClick={() => setServerSettingModal(true)}
          className="flex w-full items-center justify-between text-foreground"
        >
          <span>{serverInfomation?.name}</span>
          <FontAwesomeIcon icon={serverSettingModal ? faX : faChevronDown} />
        </button>

        {serverSettingModal && (
          <>
            <div
              role="presentation"
              tabIndex={-1}
              ref={(element) => element?.focus()}
              onKeyDown={(event) =>
                event.key === "Escape" && setServerSettingModal(false)
              }
              onClick={() => setServerSettingModal(false)}
              className="fixed inset-0 bg-black/50 z-30"
            />

            <div>
                <ServerBarItems.EditModal
                  setServerPanel={setServerPanel}
                  setServerSettingModal={setServerSettingModal}
                />
            </div>
          </>
        )}
      </div>

      <ServerBarItems.Categories />

      {serverPanel && (
        <ServerBarItems.ServerPanel
          setServerPanel={setServerPanel}
          setServerSettingModal={setServerSettingModal}
        />
      )}
    </div>
  );
}
