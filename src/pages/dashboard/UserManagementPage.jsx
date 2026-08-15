import React, { useState } from "react";
import UserManagement from "../../components/UserManagement";
import { useEmployees } from "../../hooks/useEmployees";
import { apiService } from "../../services/apiService";

export default function UserManagementPage() {
  const {
    employees, employeeLoading, employeeError, empSearch, setEmpSearch,
    empJabatan, setEmpJabatan, loadEmployees
  } = useEmployees();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [formJabatan, setFormJabatan] = useState("KARYAWAN");
  const [formShift, setFormShift] = useState(1);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const handleEditClick = (emp) => {
    setSelectedEmp(emp);
    setFormJabatan(emp.jabatan || "KARYAWAN");
    setFormShift(emp.shift_id || (emp.jabatan === "DOSEN" ? 2 : 1));
    setModalError("");
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");
    try {
      let res;
      if (selectedEmp && selectedEmp.jabatan) {
        res = await apiService.updateEmployee(selectedEmp.user_id, {
          nama: selectedEmp.nama || "",
          jabatan: formJabatan,
          shift_id: formJabatan === "DOSEN" ? parseInt(formShift) : 1
        });
      } else {
        res = await apiService.registerDeviceUser({
          deviceUserId: selectedEmp.user_id,
          nama: selectedEmp.nama || "",
          jabatan: formJabatan,
          shiftId: formJabatan === "DOSEN" ? parseInt(formShift) : 1
        });
      }

      if (res && res.success) {
        setModalOpen(false);
        loadEmployees();
      } else {
        setModalError(res?.message || "Gagal menyimpan perubahan.");
      }
    } catch (err) {
      setModalError(err.message || "Terjadi kesalahan.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <UserManagement
      employees={employees}
      empSearch={empSearch}
      setEmpSearch={setEmpSearch}
      empJabatan={empJabatan}
      setEmpJabatan={setEmpJabatan}
      employeeLoading={employeeLoading}
      loadEmployees={loadEmployees}
      employeeError={employeeError}
      handleEditClick={handleEditClick}
      modalOpen={modalOpen}
      setModalOpen={setModalOpen}
      selectedEmp={selectedEmp}
      formJabatan={formJabatan}
      setFormJabatan={setFormJabatan}
      formShift={formShift}
      setFormShift={setFormShift}
      handleModalSubmit={handleModalSubmit}
      modalLoading={modalLoading}
      modalError={modalError}
    />
  );
}
