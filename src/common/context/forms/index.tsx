import React, { createContext, FunctionComponent, useContext, useState } from "react";
import { FormData, FormEntry, FormTemplate, Ownership, SetFormParams } from "../../../types";
import { useConfigContext } from "../config";

interface FormsContext {
  activeFormIndex?: number;
  forms: FormEntry[];
  currentForm?: FormEntry;
  currentFormData?: FormData;
  currentFormOwnership?: Ownership;
  currentFormTemplate?: FormTemplate;
  setActiveFormIndex: (index?: number) => void;
  setForms: (forms: FormEntry[]) => void;
  newForm: (templateIndex: number) => void;
  newPopulatedForm: (templateIndex: number, formData: Array<FormEntry>) => void;
  setCurrentFormData: (formData: FormData) => void;
  setCurrentFormOwnership: (ownership: Ownership) => void;
  setCurrentFileName: (fileName: string) => void;
  setCurrentForm: (arg: SetFormParams) => void;
}

export const FormsContext = createContext<FormsContext>({
  forms: [],
  setActiveFormIndex: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  setForms: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  newForm: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  newPopulatedForm: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  setCurrentFormData: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  setCurrentFormOwnership: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  setCurrentFileName: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  setCurrentForm: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
});

export const useFormsContext = (): FormsContext => useContext<FormsContext>(FormsContext);

export const FormsContextProvider: FunctionComponent = ({ children }) => {
  const [activeFormIndex, setActiveFormIndex] = useState<number | undefined>(undefined);
  const [forms, setForms] = useState<FormEntry[]>([]);
  const { config } = useConfigContext();

  const currentForm = typeof activeFormIndex === "number" ? forms[activeFormIndex] : undefined;
  const currentFormData = currentForm?.data;
  const currentFormOwnership = currentForm?.ownership;
  const currentFormTemplate = currentForm ? config?.forms[currentForm?.templateIndex] : undefined;

  const newForm = (templateIndex: number): void => {
    const newIndex = forms.length;
    const newFormTemplate = config?.forms[templateIndex];
    const newFormName = newFormTemplate?.name ?? "Document";
    setForms([
      ...forms,
      {
        templateIndex,
        data: {
          formData: newFormTemplate?.defaults || {},
          schema: newFormTemplate?.schema,
        },
        fileName: `${newFormName}-${forms.length + 1}`,
        ownership: { beneficiaryAddress: "", holderAddress: "" },
      },
    ]);

    setActiveFormIndex(newIndex);
  };

  const newPopulatedForm = (templateIndex: number, formData: Array<FormEntry>): void => {
    const newFormTemplate = config?.forms[templateIndex];
    const newFormName = newFormTemplate?.name ?? "Document";
    const formsEntries = [];
    for (let i = 0; i < formData.length; i++) {
      formsEntries.push({
        templateIndex,
        data: {
          formData: formData[i],
          schema: newFormTemplate?.schema,
        },
        fileName: `${newFormName}-${i + 1}`,
        ownership: { beneficiaryAddress: "", holderAddress: "" },
      });
    }
    setForms([...formsEntries]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setCurrentFormData = (data: any): void => {
    if (activeFormIndex === undefined)
      throw new Error("Trying to set form when there is no activeFormIndex");
    setCurrentForm({ data });
  };

  const setCurrentFormOwnership = ({ beneficiaryAddress, holderAddress }: Ownership): void => {
    if (activeFormIndex === undefined)
      throw new Error("Trying to set form when there is no activeFormIndex");
    setCurrentForm({ data: undefined, updatedOwnership: { beneficiaryAddress, holderAddress } });
  };

  const setCurrentFileName = (fileName: string): void => {
    if (activeFormIndex === undefined) return;
    setCurrentForm({ data: undefined, updatedOwnership: undefined, fileName });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setCurrentForm = ({ data, updatedOwnership, fileName }: SetFormParams): void => {
    if (activeFormIndex === undefined) return;
    const currentForm = forms[activeFormIndex];
    const nextForms = [...forms];
    const updatedCurrentForm = {
      ...currentForm,
      data: data || currentForm.data,
      ownership: updatedOwnership || currentForm.ownership,
      fileName: fileName || currentForm.fileName,
    } as FormEntry;
    nextForms.splice(activeFormIndex, 1, updatedCurrentForm);
    setForms(nextForms);
  };

  return (
    <FormsContext.Provider
      value={{
        activeFormIndex,
        forms,
        currentForm,
        currentFormData,
        currentFormOwnership,
        currentFormTemplate,
        setCurrentFormData,
        setCurrentFormOwnership,
        newForm,
        newPopulatedForm,
        setActiveFormIndex,
        setForms,
        setCurrentFileName,
        setCurrentForm,
      }}
    >
      {children}
    </FormsContext.Provider>
  );
};
