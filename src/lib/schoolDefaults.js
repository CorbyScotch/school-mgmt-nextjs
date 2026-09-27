export const defaultSubjectCatalog = [
  { name: "English Language", code: "ENG" },
  { name: "Mathematics", code: "MATH" },
  { name: "Integrated Science", code: "SCI" },
  { name: "Social Studies", code: "SOC" },
  { name: "Religious and Moral Education", code: "RME" },
  { name: "Information and Communication Technology", code: "ICT" },
  { name: "Ghanaian Language", code: "GHL" },
  { name: "Creative Arts", code: "CRA" },
  { name: "Basic Design and Technology", code: "BDT" },
];

export const defaultClassLevels = [
  { stage: "Primary", level: "Primary 1", sections: ["A", "B"] },
  { stage: "Primary", level: "Primary 2", sections: ["A", "B"] },
  { stage: "Primary", level: "Primary 3", sections: ["A", "B"] },
  { stage: "Primary", level: "Primary 4", sections: ["A", "B"] },
  { stage: "Primary", level: "Primary 5", sections: ["A", "B"] },
  { stage: "Primary", level: "Primary 6", sections: ["A", "B"] },
  { stage: "JHS", level: "JHS 1", sections: ["A", "B"] },
  { stage: "JHS", level: "JHS 2", sections: ["A", "B"] },
  { stage: "JHS", level: "JHS 3", sections: ["A", "B"] },
];

export function buildAcademicYearRange() {
  const currentYear = new Date().getFullYear();
  return {
    startYear: currentYear,
    endYear: currentYear + 1,
  };
}

export function buildTermDates(acadYearStart, index) {
  const start = new Date(acadYearStart);
  const termStartMap = {
    1: 0,
    2: 4,
    3: 8,
  };

  const monthOffset = termStartMap[index] ?? 0;
  const termStart = new Date(
    start.getFullYear(),
    start.getMonth() + monthOffset,
    1,
  );

  const termEnd = new Date(
    termStart.getFullYear(),
    termStart.getMonth() + 3,
    30,
  );

  return {
    startDate: termStart,
    endDate: termEnd,
  };
}
