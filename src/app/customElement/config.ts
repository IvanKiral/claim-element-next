export type Config = Readonly<{
  textElementCodename: string;
  contentEditorRole: string;
  assignedStepCodename: string;
  unassignedStepCodename: string;
}>;

export const isConfig = (value: Readonly<Record<string, unknown>> | null) => value !== null; // use better check
