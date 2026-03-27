import API from "../api";

export interface CreateOwnerData {
  email: string;
  fullName: string;
  phoneNumber: string;
  highestQualification: string;
  occupation: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  idProofType: string;
  gender: string;
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  idProof: File | null;
  profileImage: File | null;
}

export const createOwner = async (data: CreateOwnerData): Promise<string> => {
  const fd = new FormData();

  fd.append("email", data.email.trim());
  fd.append("fullName", data.fullName.trim());
  fd.append("phoneNumber", data.phoneNumber.trim());
  fd.append("highestQualification", data.highestQualification.trim());
  fd.append("occupation", data.occupation.trim());
  fd.append("street", data.street.trim());
  fd.append("city", data.city.trim());
  fd.append("state", data.state.trim());
  fd.append("pincode", data.pincode.trim());
  fd.append("idProofType", data.idProofType);
  fd.append("gender", data.gender);
  fd.append("dateOfBirth", data.dateOfBirth);

  if (data.fatherName.trim()) fd.append("fatherName", data.fatherName.trim());
  if (data.motherName.trim()) fd.append("motherName", data.motherName.trim());

  if (data.idProof) fd.append("idProof", data.idProof);
  if (data.profileImage) fd.append("profileImage", data.profileImage);

  const res = await API.post("/admin/create-owner", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return typeof res.data === "string" ? res.data : res.data?.message || "Owner created successfully.";
};
