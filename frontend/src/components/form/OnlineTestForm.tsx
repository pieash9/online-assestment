import type { BaseSyntheticEvent } from "react";
import { useMemo } from "react";
import {
    Controller,
    type Control,
    type FieldErrors,
    type UseFormRegister,
} from "react-hook-form";
import {
    type OnlineTestFormInput,
    toDatetimeLocalValue,
} from "@/lib/forms/online-test";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type OnlineTestFormProps = {
    control: Control<OnlineTestFormInput>;
    register: UseFormRegister<OnlineTestFormInput>;
    errors: FieldErrors<OnlineTestFormInput>;
    values: OnlineTestFormInput;
    onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
    submittingLabel?: string;
    isSubmitting?: boolean;
    showActions?: boolean;
    formId?: string;
    enforceFutureStartTime?: boolean;
};

const inputClassName =
    "h-12 rounded-xl border-[#d1d5db] text-sm text-[#334155] focus-visible:border-[#6633ff] focus-visible:ring-[#6633ff]/10";

const OnlineTestForm = ({
    control,
    register,
    errors,
    values,
    onSubmit,
    onCancel,
    submitLabel = "Save & Continue",
    submittingLabel = "Saving...",
    isSubmitting = false,
    showActions = true,
    formId,
    enforceFutureStartTime = true,
}: OnlineTestFormProps) => {
    const initialMinDateTime = useMemo(() => toDatetimeLocalValue(new Date()), []);

    const startTimeMin = enforceFutureStartTime ? initialMinDateTime : undefined;
    const endTimeMin = values.startTime || (enforceFutureStartTime ? initialMinDateTime : undefined);

    return (
        <form className="space-y-6" id={formId} onSubmit={onSubmit}>
            <FieldGroup className="gap-6">
                <Field>
                    <FieldLabel htmlFor="title">Online Test Title</FieldLabel>
                    <FieldContent>
                        <Input
                            id="title"
                            className={inputClassName}
                            placeholder="Psychometric Test for Management Trainee Officer"
                            {...register("title")}
                        />
                        <FieldError errors={[errors.title]} />
                    </FieldContent>
                </Field>

                <div className="grid gap-6 md:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="totalCandidates">Total Candidates</FieldLabel>
                        <FieldContent>
                            <Input
                                id="totalCandidates"
                                className={inputClassName}
                                min={1}
                                type="number"
                                {...register("totalCandidates")}
                            />
                            <FieldError errors={[errors.totalCandidates]} />
                        </FieldContent>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="totalSlots">Total Slots</FieldLabel>
                        <FieldContent>
                            <Input
                                id="totalSlots"
                                className={inputClassName}
                                min={1}
                                type="number"
                                {...register("totalSlots")}
                            />
                            <FieldError errors={[errors.totalSlots]} />
                        </FieldContent>
                    </Field>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="questionSets">Total Question Set</FieldLabel>
                        <FieldContent>
                            <Input
                                id="questionSets"
                                className={inputClassName}
                                min={1}
                                type="number"
                                {...register("questionSets")}
                            />
                            <FieldError errors={[errors.questionSets]} />
                        </FieldContent>
                    </Field>

                    <Field>
                        <FieldLabel>Question Type</FieldLabel>
                        <FieldContent>
                            <Controller
                                control={control}
                                name="questionType"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="h-12 w-full rounded-xl border-[#d1d5db] px-4 text-sm text-[#334155] focus-visible:border-[#6633ff] focus-visible:ring-[#6633ff]/10">
                                            <SelectValue placeholder="Select question type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="RADIO">MCQ</SelectItem>
                                                <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                                                <SelectItem value="TEXT">Text</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FieldError errors={[errors.questionType]} />
                        </FieldContent>
                    </Field>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="startTime">Start Time</FieldLabel>
                        <FieldContent>
                            <Input
                                id="startTime"
                                className={inputClassName}
                                min={startTimeMin}
                                type="datetime-local"
                                {...register("startTime")}
                            />
                            <FieldError errors={[errors.startTime]} />
                        </FieldContent>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="endTime">End Time</FieldLabel>
                        <FieldContent>
                            <Input
                                id="endTime"
                                className={inputClassName}
                                min={endTimeMin}
                                type="datetime-local"
                                {...register("endTime")}
                            />
                            <FieldError errors={[errors.endTime]} />
                        </FieldContent>
                    </Field>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="durationMinutes">Duration Per Slots (Minutes)</FieldLabel>
                        <FieldContent>
                            <Input
                                id="durationMinutes"
                                className={inputClassName}
                                min={1}
                                type="number"
                                {...register("durationMinutes")}
                            />
                            <FieldError errors={[errors.durationMinutes]} />
                        </FieldContent>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="negativeMarking">Negative Marking</FieldLabel>
                        <FieldContent>
                            <Input
                                id="negativeMarking"
                                className={inputClassName}
                                min={0}
                                step="0.25"
                                type="number"
                                {...register("negativeMarking")}
                            />
                            <FieldDescription>
                                Set 0 if there is no negative marking for this exam.
                            </FieldDescription>
                            <FieldError errors={[errors.negativeMarking]} />
                        </FieldContent>
                    </Field>
                </div>
            </FieldGroup>

            {showActions ? (
                <div className="flex items-center justify-between rounded-2xl bg-[#f8fafc] px-4 py-4 sm:px-6">
                    <Button
                        className="h-11 min-w-40 rounded-xl border border-[#d7dde7] bg-white px-8 text-[#334155] hover:bg-[#f8fafc]"
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="h-11 min-w-44 rounded-xl bg-[#6633ff] px-8 text-white hover:bg-[#5b2ef0]"
                        disabled={isSubmitting}
                        type="submit"
                    >
                        {isSubmitting ? submittingLabel : submitLabel}
                    </Button>
                </div>
            ) : null}
        </form>
    );
};

export default OnlineTestForm;