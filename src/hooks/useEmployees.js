import { useState, useCallback, useEffect } from "react";
import { apiService } from "../services/apiService";
import { authService } from "../services/authService";

export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState("");
  const [empSearch, setEmpSearch] = useState("");
  const [empJabatan, setEmpJabatan] = useState("");
  const [unregisteredCount] = useState(0);

  const loadEmployees = useCallback(async () => {
    setEmployeeLoading(true);
    setEmployeeError("");
    try {
      const res = await apiService.fetchEmployees(1, 200, '', '', '', '');
      const list = res?.data?.data || res?.data || [];
      setEmployees(list);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployeeError("Gagal mengambil data pegawai");
    } finally {
      setEmployeeLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const isPimpinan = currentUser?.role?.toLowerCase() === "pimpinan";
    if (!isPimpinan) {
      loadEmployees();
    }
  }, [loadEmployees]);

  return {
    employees,
    employeeLoading,
    employeeError,
    empSearch,
    setEmpSearch,
    empJabatan,
    setEmpJabatan,
    unregisteredCount,
    loadEmployees,
  };
}
