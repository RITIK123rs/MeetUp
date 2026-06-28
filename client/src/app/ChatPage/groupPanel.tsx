import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { IoPeopleOutline } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";
import { socket } from "@/lib/socket";
import { addNewGroup } from "@/redux/userSlice";

type Contacts = {
  userId: string;
  name: string;
  picture: string;
};

type SelectedUser = {
  userId: string | null;
  name: string | null;
};

interface GroupPanelProps {
  setGroupPanelStatus: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function GroupPanel({ setGroupPanelStatus }:GroupPanelProps) {
  const Dispatch = useDispatch();
  const contacts: Contacts[] = useSelector(
    (state: RootState) => state.user.contacts,
  );
  const { name, id }: { name: string | null; id: string | null } = useSelector(
    (state: RootState) => state.user,
  );
  const [selectedUser, setSelectedUser] = useState<SelectedUser[]>([
    {
      userId: id,
      name: name,
    },
  ]);
  const [groupName, setGroupName] = useState<string>("");

  function togglePerson(userId: string, name: string) {
    setSelectedUser((prev) =>
      prev.some((user) => user.userId === userId)
        ? prev.filter((user) => user.userId !== userId)
        : [...prev, { userId, name }],
    );
  }

  async function handleCreateGroup() {
    if (selectedUser.length < 3 || groupName.trim().length == 0) return;
    if (!id) return;
    console.log(selectedUser);
    const res = await axios.post("http://localhost:5000/newGroupAdd", {
      groupName: groupName.trim(),
      users: selectedUser,
    });
    if (res.data.success) {
      let updateChat = res.data.chats;
      console.log(updateChat);
      Dispatch(addNewGroup(updateChat[id]));
      delete updateChat[id];
      socket.emit("NewGroup", updateChat);
    } else {
      console.log("Server Error");
    }
    setGroupName("");
    setSelectedUser([
      {
        userId: id,
        name: name,
      },
    ]);
    setGroupPanelStatus(false);
  }

  return (
    <div className="gp-overlay">
      <div
        className="gp-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-panel-title"
      >
        <div className="gp-header">
          <span className="flex items-center gap-3">
            <IoPeopleOutline className="text-3xl" />
            <h2 id="group-panel-title">Create New Group</h2>
          </span>
          <button
            type="button"
            className="gp-close-btn"
            onClick={() => setGroupPanelStatus(false)}
            aria-label="Close"
          >
            <IoClose />
          </button>
        </div>

        <p className="gp-section-label ms-3 mt-3">Contacts</p>
        <div className="gp-list">
          {contacts.length === 0 ? (
            <p className="gp-empty">
              No contacts yet. Add people from Home first.
            </p>
          ) : (
            contacts.map((contact) => {
              const selected = selectedUser.some(
                (user) => user.userId == contact.userId,
              );
              return (
                <button
                  key={contact.userId}
                  type="button"
                  className={`gp-person-item ${selected ? "selected" : ""}`}
                  onClick={() => togglePerson(contact.userId, contact.name)}
                >
                  <span
                    className={`gp-checkbox ${selected ? "checked" : ""}`}
                    aria-hidden
                  >
                    {selected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>

                  <span
                    className="gp-avatar"
                    style={{
                      backgroundImage: `url(${contact.picture ?? "/userPic.jpg"})`,
                    }}
                  />

                  <span className="gp-person-info">
                    <span className="gp-person-name">{contact.name}</span>
                    <span className="gp-person-id">{contact.userId}</span>
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="gp-footer">
          <div className="gp-footer-form">
            <input
              type="text"
              className="gp-input"
              placeholder="Enter group name…"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            <button
              type="button"
              className="gp-create-btn"
              onClick={handleCreateGroup}
            >
              Create Group
              {selectedUser.length > 0 && (
                <span className="gp-count-badge">
                  {selectedUser.length - 1}
                </span>
              )}
            </button>

            {selectedUser.length < 3 && (
              <p className="gp-hint">
                Select at least 2 people to create a group.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
