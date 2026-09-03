export function validateDate(input: string): { valid: true } | { valid: false; message: string } {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(input)) {
    return { valid: false, message: "Formato inválido. Usá dd/mm/aaaa" };
  }

  const [dayStr, monthStr, yearStr] = input.split("/");
  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { valid: false, message: "La fecha no es válida" };
  }

  return { valid: true };
}
