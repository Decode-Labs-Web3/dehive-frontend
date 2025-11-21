"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import ServerBarItems from "@/components/server-bar";
import { useServersList } from "@/hooks/useServersList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { faX, faChevronDown } from "@fortawesome/free-solid-svg-icons";

export default function ServerBar() {
  const { serversList } = useServersList();
  const { serverId } = useParams<{
    serverId: string;
  }>();
  const serverInfomation = useMemo(() => {
    return serversList.find((server) => server._id === serverId);
  }, [ serversList, serverId]);
  const [serverPanel, setServerPanel] = useState(false);
  const [serverSettingModal, setServerSettingModal] = useState(false);
  if (!serverInfomation) {
    return null;
  }
  return (
    <div className="w-full h-full bg-background border border-border flex flex-col">
      <div className="relative bg-secondary border border-border p-2 font-bold z-20 shrink-0">
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
                serverInfomation={serverInfomation}
                setServerSettingModal={setServerSettingModal}
              />
            </div>
          </>
        )}
      </div>

      <ScrollArea className="flex-1">
        <ServerBarItems.Categories serverInfomation={serverInfomation}/>
        <div
          className="h-[180px] shrink-0 pointer-events-none"
          aria-hidden="true"
        />
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      {serverPanel && (
        <ServerBarItems.ServerPanel
          setServerPanel={setServerPanel}
          serverInfomation={serverInfomation}
          setServerSettingModal={setServerSettingModal}
        />
      )}
    </div>
  );
}
