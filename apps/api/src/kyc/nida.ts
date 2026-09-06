const statuses: Record<string, string> = {
  S: "SINGLE",
  M: "MARRIED",
  D: "DIVORCED",
  W: "WIDOWED",
};

const provinces: Record<string, string> = {
  Amajyaruguru: "Northern",
  Amajyepfo: "Southern",
  Iburengerazuba: "Western",
  "Umujyi wa Kigali": "Kigali City",
  Iburasirazuba: "Eastern",
};

const genders: Record<string, string> = {
  M: "MALE",
  F: "FEMALE",
};

export type NidaResponse = {
  dateOfBirth: string;
  cell: string;
  civilStatus: string;
  documentNumber: string;
  documentType: string;
  foreName: string;
  placeOfBirth: string;
  nationality: string;
  photo: string;
  spouse: string;
  province: string;
  sex: string;
  villageID: string;
  surnames: string;
  village: string;
  sector: string;
  district: string;
  applicationNumber: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  fatherName: string;
  motherName: string;
  placeOfIssue: string;
  fatherNames: string;
  id: string;
  issueNumber: string;
  motherNames: string;
  signature: string;
  timeSubmitted: string;
  status: string;
};

function formatProvince(province: string): string {
  return provinces[province] ?? "Kigali City";
}

function formatGender(gender: string): string {
  return genders[gender] ?? "OTHER";
}

function formatCivilStatus(civilStatus: string): string {
  return statuses[civilStatus] ?? "SINGLE";
}

export function formatNidaResponse(response: NidaResponse): NidaResponse {
  return {
    ...response,
    province: formatProvince(response.province),
    sex: formatGender(response.sex),
    civilStatus: formatCivilStatus(response.civilStatus),
  };
}
