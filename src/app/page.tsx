"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type ApiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string; response: unknown }
  | { status: "error"; message: string; response?: unknown };

type IBeaconRecord = {
  id: string;
  date: string;
  uuid: string;
  major: number;
  minor: number;
  comment: string | null;
  created_at: string;
  user_id: string | null;
  user_name: string | null;
  department: string | null;
};

type RecordsState =
  | { status: "loading" }
  | { status: "success"; records: IBeaconRecord[] }
  | { status: "error"; message: string };

type RecordFilters = {
  created: string;
  date: string;
  uuid: string;
  major: string;
  minor: string;
  comment: string;
  user_id: string;
  user_name: string;
  department: string;
};

const sampleUuid = "74278bda-b644-4520-8f0c-720eaf059935";

const emptyFilters: RecordFilters = {
  created: "",
  date: "",
  uuid: "",
  major: "",
  minor: "",
  comment: "",
  user_id: "",
  user_name: "",
  department: ""
};

function toDateFilterValue(value: string) {
  const targetDate = new Date(value);

  if (Number.isNaN(targetDate.getTime())) {
    return "";
  }

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function maskUuid(value: string) {
  const trimmedValue = value.trim();
  const visibleLength = 18;

  if (trimmedValue.length <= visibleLength) {
    return trimmedValue;
  }

  return `${trimmedValue.slice(0, visibleLength)}******************`;
}

export default function Home() {
  const [date, setDate] = useState("");
  const [uuid, setUuid] = useState(sampleUuid);
  const [major, setMajor] = useState("1");
  const [minor, setMinor] = useState("1");
  const [comment, setComment] = useState("Web test");
  const [userId, setUserId] = useState("U001");
  const [userName, setUserName] = useState("山田 太郎");
  const [department, setDepartment] = useState("営業部");
  const [apiState, setApiState] = useState<ApiState>({ status: "idle" });
  const [recordsState, setRecordsState] = useState<RecordsState>({
    status: "loading"
  });
  const [filters, setFilters] = useState<RecordFilters>(emptyFilters);

  const requestPreview = useMemo(
    () => ({
      date,
      uuid: maskUuid(uuid),
      major: Number(major),
      minor: Number(minor),
      comment,
      userId,
      userName,
      department,
    }),
    [comment, date, major, minor, uuid, userId, userName, department]
  );

  const requestPayload = useMemo(
    () => ({
      date,
      uuid,
      major: Number(major),
      minor: Number(minor),
      comment,
      userId,
      userName,
      department,
    }),
    [comment, date, major, minor, uuid, userId, userName, department]
  );

  const filteredRecords = useMemo(() => {
    if (recordsState.status !== "success") {
      return [];
    }

    const normalizedFilters = Object.fromEntries(
      Object.entries(filters).map(([key, value]) => [
        key,
        value.trim().toLowerCase()
      ])
    ) as RecordFilters;

    return recordsState.records.filter((record) => {
      const row = {
        created: toDateFilterValue(record.created_at),
        date: toDateFilterValue(record.date),
        uuid: record.uuid.toLowerCase(),
        major: String(record.major),
        minor: String(record.minor),
        comment: (record.comment ?? "").toLowerCase(),
        user_id: (record.user_id ?? "").toLowerCase(),
        user_name: (record.user_name ?? "").toLowerCase(),
        department: (record.department ?? "").toLowerCase()
      };

      return Object.entries(normalizedFilters).every(([key, value]) => {
        if (!value) {
          return true;
        }

        return row[key as keyof RecordFilters].includes(value);
      });
    });
  }, [filters, recordsState]);

  const hasActiveFilters = Object.values(filters).some(
    (value) => value.trim() !== ""
  );

  useEffect(() => {
    setDate(new Date().toISOString());
    void loadRecords();
  }, []);

  async function loadRecords() {
    setRecordsState({ status: "loading" });

    try {
      const response = await fetch("/api/ibeacons", {
        cache: "no-store"
      });
      const json = await response.json();

      if (!response.ok || !json.ok) {
        const message =
          Array.isArray(json.errors) && json.errors.length > 0
            ? json.errors.join(", ")
            : `HTTP ${response.status}`;
        setRecordsState({ status: "error", message });
        return;
      }

      setRecordsState({ status: "success", records: json.data ?? [] });
    } catch (error) {
      setRecordsState({
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown request error"
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiState({ status: "loading" });

    try {
      const response = await fetch("/api/ibeacons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
      });
      const json = await response.json();

      if (!response.ok) {
        setApiState({
          status: "error",
          message: `HTTP ${response.status}`,
          response: json
        });
        return;
      }

      setApiState({
        status: "success",
        message: "The beacon data was registered successfully.",
        response: json
      });
      await loadRecords();
    } catch (error) {
      setApiState({
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown request error"
      });
    }
  }

  function fillCurrentDate() {
    setDate(new Date().toISOString());
  }

  function updateFilter(key: keyof RecordFilters, value: string) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value
    }));
  }

  return (
    <main className="shell">
      <header className="siteHeader">
        <div className="siteHeaderInner">
          <Link className="brandMark" href="/" aria-label="Beacon API home">
            <span className="brandIcon" aria-hidden="true">
              B
            </span>
            <span>
              <strong>Beacon Data Registration Check</strong>
            </span>
          </Link>

          <nav className="topNav" aria-label="Main navigation">
            <Link className="active" href="/">
              Tester
            </Link>
            <Link href="/about">About</Link>
          </nav>
        </div>
      </header>

      <section className="workspace">
        <div className="noticeBox" role="note">
          <strong>このWebアプリについて</strong>
          <p>
            このWebアプリは技術検証用に作成したものです。個人でSupabaseへの登録や表示の動作確認をしたいことがあり、確認用のサーバーを立てています。
          </p>
          <p>
            「Send to API」ボタンを押すと実際にデータが登録されるため、必要なとき以外はあまり押さないでください。
          </p>
        </div>

        <div className="contentGrid">
          <form className="panel formPanel" onSubmit={handleSubmit}>
            <label>
              <span>Date</span>
              <div className="inlineControl">
                <input
                  required
                  type="text"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
                <button type="button" onClick={fillCurrentDate}>
                  Now
                </button>
              </div>
            </label>

            <label>
              <span>UUID</span>
              <input
                required
                type="text"
                value={uuid}
                onChange={(event) => setUuid(event.target.value)}
              />
            </label>

            <div className="fieldRow">
              <label>
                <span>Major</span>
                <input
                  required
                  min="0"
                  type="number"
                  value={major}
                  onChange={(event) => setMajor(event.target.value)}
                />
              </label>

              <label>
                <span>Minor</span>
                <input
                  required
                  min="0"
                  type="number"
                  value={minor}
                  onChange={(event) => setMinor(event.target.value)}
                />
              </label>
            </div>

            <label>
              <span>Comment</span>
              <textarea
                rows={4}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </label>

            <label>
              <span>User ID</span>
              <input
                type="text"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
              />
            </label>

            <label>
              <span>User Name</span>
              <input
                type="text"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
              />
            </label>

            <label>
              <span>Department</span>
              <input
                type="text"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
              />
            </label>

            <button
              className="submitButton"
              disabled={apiState.status === "loading"}
              type="submit"
            >
              {apiState.status === "loading" ? "Sending..." : "Send to API"}
            </button>
          </form>

          <aside className="panel resultPanel">
            <div>
              <h2>Request</h2>
              <pre>{JSON.stringify(requestPreview, null, 2)}</pre>
            </div>

            <div>
              <h2>Response</h2>
              {apiState.status === "idle" ? (
                <p className="muted">No request has been sent yet.</p>
              ) : (
                <>
                  <p className={`status ${apiState.status}`}>
                    {apiState.status === "loading"
                      ? "Sending..."
                      : apiState.message}
                  </p>
                  {"response" in apiState && apiState.response ? (
                    <pre>{JSON.stringify(apiState.response, null, 2)}</pre>
                  ) : null}
                </>
              )}
            </div>
          </aside>

          <section className="panel recordsPanel">
            <div className="recordsHeader">
              <div>
                <h2>Registered Data</h2>
                <p className="muted">Latest 20 rows from the Supabase table.</p>
              </div>
              <button
                className="refreshButton"
                type="button"
                onClick={loadRecords}
                disabled={recordsState.status === "loading"}
              >
                {recordsState.status === "loading" ? "Loading..." : "Refresh"}
              </button>
              <button
                className="refreshButton"
                type="button"
                onClick={() => setFilters(emptyFilters)}
                disabled={!hasActiveFilters}
              >
                Clear Filters
              </button>
            </div>

            {recordsState.status === "error" ? (
              <p className="status error">{recordsState.message}</p>
            ) : recordsState.status === "loading" ? (
              <p className="muted">Loading registered data...</p>
            ) : recordsState.records.length === 0 ? (
              <p className="muted">No registered data yet.</p>
            ) : filteredRecords.length === 0 ? (
              <>
                <div className="tableWrap">
                  <table>
                    <thead>
                      <tr>
                        <th>
                          <span>Created</span>
                          <input
                            aria-label="Filter created date"
                            className="filterInput"
                            type="date"
                            value={filters.created}
                            onChange={(event) =>
                              updateFilter("created", event.target.value)
                            }
                            onInput={(event) =>
                              updateFilter(
                                "created",
                                event.currentTarget.value
                              )
                            }
                          />
                        </th>
                        <th>
                          <span>Date</span>
                          <input
                            aria-label="Filter date"
                            className="filterInput"
                            type="date"
                            value={filters.date}
                            onChange={(event) =>
                              updateFilter("date", event.target.value)
                            }
                            onInput={(event) =>
                              updateFilter("date", event.currentTarget.value)
                            }
                          />
                        </th>
                        <th>
                          <span>UUID</span>
                          <input
                            aria-label="Filter UUID"
                            className="filterInput"
                            value={filters.uuid}
                            onChange={(event) =>
                              updateFilter("uuid", event.target.value)
                            }
                            placeholder="Filter"
                          />
                        </th>
                        <th className="narrowCell">
                          <span>Major</span>
                          <input
                            aria-label="Filter major"
                            className="filterInput"
                            value={filters.major}
                            onChange={(event) =>
                              updateFilter("major", event.target.value)
                            }
                            placeholder="Filter"
                          />
                        </th>
                        <th className="narrowCell">
                          <span>Minor</span>
                          <input
                            aria-label="Filter minor"
                            className="filterInput"
                            value={filters.minor}
                            onChange={(event) =>
                              updateFilter("minor", event.target.value)
                            }
                            placeholder="Filter"
                          />
                        </th>
                        <th>
                          <span>Comment</span>
                          <input
                            aria-label="Filter comment"
                            className="filterInput"
                            value={filters.comment}
                            onChange={(event) =>
                              updateFilter("comment", event.target.value)
                            }
                            placeholder="Filter"
                          />
                        </th>
                        <th>
                          <span>User ID</span>
                          <input
                            aria-label="Filter user ID"
                            className="filterInput"
                            value={filters.user_id}
                            onChange={(event) =>
                              updateFilter("user_id", event.target.value)
                            }
                            placeholder="Filter"
                          />
                        </th>
                        <th>
                          <span>User Name</span>
                          <input
                            aria-label="Filter user name"
                            className="filterInput"
                            value={filters.user_name}
                            onChange={(event) =>
                              updateFilter("user_name", event.target.value)
                            }
                            placeholder="Filter"
                          />
                        </th>
                        <th>
                          <span>Department</span>
                          <input
                            aria-label="Filter department"
                            className="filterInput"
                            value={filters.department}
                            onChange={(event) =>
                              updateFilter("department", event.target.value)
                            }
                            placeholder="Filter"
                          />
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <p className="muted tableMessage">
                  No rows match the current filters.
                </p>
              </>
            ) : (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>
                        <span>Created</span>
                        <input
                          aria-label="Filter created date"
                          className="filterInput"
                          type="date"
                          value={filters.created}
                          onChange={(event) =>
                            updateFilter("created", event.target.value)
                          }
                          onInput={(event) =>
                            updateFilter("created", event.currentTarget.value)
                          }
                        />
                      </th>
                      <th>
                        <span>Date</span>
                        <input
                          aria-label="Filter date"
                          className="filterInput"
                          type="date"
                          value={filters.date}
                          onChange={(event) =>
                            updateFilter("date", event.target.value)
                          }
                          onInput={(event) =>
                            updateFilter("date", event.currentTarget.value)
                          }
                        />
                      </th>
                      <th>
                        <span>UUID</span>
                        <input
                          aria-label="Filter UUID"
                          className="filterInput"
                          value={filters.uuid}
                          onChange={(event) =>
                            updateFilter("uuid", event.target.value)
                          }
                          placeholder="Filter"
                        />
                      </th>
                      <th className="narrowCell">
                        <span>Major</span>
                        <input
                          aria-label="Filter major"
                          className="filterInput"
                          value={filters.major}
                          onChange={(event) =>
                            updateFilter("major", event.target.value)
                          }
                          placeholder="Filter"
                        />
                      </th>
                      <th className="narrowCell">
                        <span>Minor</span>
                        <input
                          aria-label="Filter minor"
                          className="filterInput"
                          value={filters.minor}
                          onChange={(event) =>
                            updateFilter("minor", event.target.value)
                          }
                          placeholder="Filter"
                        />
                      </th>
                      <th>
                        <span>Comment</span>
                        <input
                          aria-label="Filter comment"
                          className="filterInput"
                          value={filters.comment}
                          onChange={(event) =>
                            updateFilter("comment", event.target.value)
                          }
                          placeholder="Filter"
                        />
                      </th>
                      <th>
                        <span>User ID</span>
                        <input
                          aria-label="Filter user ID"
                          className="filterInput"
                          value={filters.user_id}
                          onChange={(event) =>
                            updateFilter("user_id", event.target.value)
                          }
                          placeholder="Filter"
                        />
                      </th>
                      <th>
                        <span>User Name</span>
                        <input
                          aria-label="Filter user name"
                          className="filterInput"
                          value={filters.user_name}
                          onChange={(event) =>
                            updateFilter("user_name", event.target.value)
                          }
                          placeholder="Filter"
                        />
                      </th>
                      <th>
                        <span>Department</span>
                        <input
                          aria-label="Filter department"
                          className="filterInput"
                          value={filters.department}
                          onChange={(event) =>
                            updateFilter("department", event.target.value)
                          }
                          placeholder="Filter"
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id}>
                        <td>{new Date(record.created_at).toLocaleString()}</td>
                        <td>{new Date(record.date).toLocaleString()}</td>
                        <td className="uuidCell">{record.uuid}</td>
                        <td className="narrowCell">{record.major}</td>
                        <td className="narrowCell">{record.minor}</td>
                        <td>{record.comment ?? ""}</td>
                        <td>{record.user_id ?? ""}</td>
                        <td>{record.user_name ?? ""}</td>
                        <td>{record.department ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </section>

      <footer className="siteFooter">
        <div className="siteFooterInner">
          <span>&copy; 2025 tikomo software</span>
          <span>Personal verification tool</span>
        </div>
      </footer>
    </main>
  );
}
