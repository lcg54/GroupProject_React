export const prettyLabel = (s) => s?.replace(/_/g, " ");

export const onlyDigits = (s) => (s || "")?.replace(/[^0-9]/g, "");