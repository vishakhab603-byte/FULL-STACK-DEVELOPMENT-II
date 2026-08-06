import React from "react";
import { useSelector } from "react-redux";
import { Fingerprint, RefreshCw, LogOut, KeyRound, Activity } from "lucide-react";
import { selectAuditLog } from "../features/audit/auditSlice";
import { Card, CardLabel } from "../components/Card";

const ICONS = { login: Fingerprint, switch: RefreshCw, logout: LogOut, refresh: KeyRound, content: Activity };

export default function AuditChronicle() {
  const auditLog = useSelector(selectAuditLog);

  return (
    <Card>
      <CardLabel>Audit Chronicle — every identity event, recorded</CardLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {auditLog.length === 0 && <div style={{ color: "#586176", fontSize: 12.5 }}>No events yet this session.</div>}
        {auditLog.map((e) => {
          const Icon = ICONS[e.type] || Activity;
          return (
            <div key={e.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", borderLeft: `2px solid ${e.color}`, paddingLeft: 12 }}>
              <Icon size={14} color={e.color} style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12.5 }}>{e.message}</div>
                <div style={{ color: "#586176", fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }}>{e.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
