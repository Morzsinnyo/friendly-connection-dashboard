import { differenceInYears } from "date-fns";

interface AgeDisplayProps {
  birthday: string;
}

export function AgeDisplay({ birthday }: AgeDisplayProps) {
  const calculateNextBirthday = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    const nextBirthday = new Date(birthDate);
    nextBirthday.setFullYear(today.getFullYear());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const age = differenceInYears(nextBirthday, birthDate);
    return age;
  };

  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-600">
        🎂 {new Date(birthday).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
      </span>
      <span className="text-xs text-gray-500">
        Turns {calculateNextBirthday(birthday)} this year
      </span>
    </div>
  );
}