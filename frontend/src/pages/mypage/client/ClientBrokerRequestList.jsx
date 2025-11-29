import React, { useEffect, useState } from "react";
import axios from "axios";

const ClientBrokerRequestList = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await axios.get("/api/client/broker-requests/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(response.data)) {
          setRequests(response.data);
        } else {
          setRequests([]);
        }
      } catch (error) {
        console.error("Failed to fetch broker requests:", error);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div style={{ padding: "20px", color: "#000" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        仲介者申請一覧
      </h2>

      {requests.length === 0 ? (
        <p>現在、仲介者からの申請はありません。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {Array.isArray(requests)
            ? requests.map((req) => (
                <li
                  key={req.id}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    padding: "15px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                  }}
                >
                  <p>タスクID: {req.task}</p>
                  <p>仲介者: {req.broker_name}</p>
                  <p>メッセージ: {req.message}</p>
                </li>
              ))
            : null}
        </ul>
      )}
    </div>
  );
};

export default ClientBrokerRequestList;
