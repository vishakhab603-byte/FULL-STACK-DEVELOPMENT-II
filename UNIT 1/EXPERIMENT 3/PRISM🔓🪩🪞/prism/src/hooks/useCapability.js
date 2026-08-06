import { useSelector } from "react-redux";
import { selectRoleKey } from "../features/auth/authSlice";
import { hasCapability } from "../utils/permission.utils";

export function useCapability(capabilityId) {
  const roleKey = useSelector(selectRoleKey);
  return hasCapability(roleKey, capabilityId);
}
