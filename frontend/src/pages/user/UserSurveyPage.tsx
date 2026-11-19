import { useLocation, useNavigate } from "react-router-dom";
import DesktopNavbar from "../../components/DesktopNavbar";
import { ChevronLeft, Triangle } from "lucide-react";
import { useEffect, useState } from "react";
import { QuestionEntry } from "../../types/formQuestions";
import Button from "../../components/Button";
import { useAuthContext } from "../../hooks/useAuthContext";
import axios from "axios";
import FormAnswerProps, { AnswerEntry } from "../../types/formAnswers";

const UserSurveyPage: React.FC = () => {
    const { user } = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();
    const formData = location.state?.form;
    const questions: QuestionEntry[] = formData.questions;
    const [userAnswer, setUserAnswer] = useState<FormAnswerProps | null>(null);
    const [answers, setAnswers] = useState<{ [index: number]: any }>({});

    const loadExistingAnswers = async() => {
        try {
            // get existing answers
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/survey/survey-answer/${formData._id}/${user?._id}`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedUserAnswer = response.data;
            setUserAnswer(fetchedUserAnswer);
            // console.log("Form answers already exist: ", fetchedUserAnswer);
            // console.log("Form answers already exist: ", fetchedUserAnswer.answer.answers);
            
            // construct fetched answers in the same format used in the answers state variable
            const answersArray = (fetchedUserAnswer.answer.answers as AnswerEntry[]).reduce((acc: { [index: number]: any }, { question_id, answer_text, answer_choices, uploaded_file_url }) => {
                if (questions[question_id].type === 'FileUpload'){
                    acc[question_id] = uploaded_file_url;
                } else if (questions[question_id].type === 'MultipleChoice'){
                    acc[question_id] = answer_choices;
                } else if (questions[question_id].type === 'Likert'){
                    acc[question_id] = Number(answer_text);
                } else {
                    acc[question_id] = answer_text;
                }
                return acc;
            }, {});

            // console.log(answersArray);
            setAnswers(answersArray);
            
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 500) {
                    console.log("No answers found for this form");
                }
            }
        }
    };

    // fetch needed data on mount
    useEffect(() => {
        loadExistingAnswers();
    }, []);

    const handleAnswerChange = (index: number, value: any) => {
        if (value instanceof FileList) {
            // Handle file input
            const file = value[0];
            setAnswers((prev) => ({ ...prev, [index]: file }));
        } else {
            setAnswers((prev) => ({ ...prev, [index]: value }));
        }
    };

    const handleSubmitSurveyForm = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent page reload
        console.log(answers);

        const dateNow = new Date();
        // construct form answers array
        const formAnswers: AnswerEntry[] = questions.map((question, index) => {
            if (question.type === 'FileUpload'){
                return { question_id: index, uploaded_file_url: "" };
                // return { question_id: index, uploaded_file_url: answers[index] };
            } else if (question.type === 'MultipleChoice'){
                return { question_id: index, answer_choices: answers[index] };
            } else if (question.type === 'Likert'){
                return { question_id: index, answer_text: String(answers[index]) };
            } {
                return { question_id: index, answer_text: answers[index] };
            }
        });

        try {
            const payload = JSON.stringify({
                form_id: formData._id,
                answered_by: user?._id,
                answers: formAnswers,
                created_at: userAnswer ? userAnswer.created_at : dateNow,
                updated_at: dateNow,
            });
            console.log(payload);

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/survey/survey-answer`, payload, {
              method: "POST",
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
              },
            });
      
            if (response) {
                console.log(response);
                // if success go back
                navigate(-1);
            } else {
                console.error("Survey submission failed");
              // Show error message
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 500) {
                    console.log("Database error or other server-side issue during processing.");
                }
            }
        }
    };

    return (
        <div className="bg-Tertiary min-h-[100vh]">
            <DesktopNavbar activePage=""/>
            <div className="flex justify-center">
                <div className="max-w-[1280px] w-full flex flex-col justify-center items-center p-20">
                    <div className="bg-white w-full flex flex-col gap-8 px-15 py-10 rounded-xl border-[2px] border-ProfileBorder">
                        {/* Survey Header */}
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-5xl sm:text-3xl text-primary">
                                {formData.title}
                            </h3>

                            {/* Close Button (hidden on small screens) */}
                            <button
                                type="button"
                                className="hidden sm:flex text-gray-500 hover:text-gray-700 transition cursor-pointer items-center"
                                onClick={() => {
                                    navigate(-1)
                                }}
                                >
                                <ChevronLeft size={20} />
                                <span className="ml-1">Back to Profile</span>
                            </button>
                        </div>
                        
                        {/* Survey Description */}
                        <p className="text-sm sm:text-md text-primary">{formData.description}</p>

                        {/* Form Body */}
                        <form id="surveyForm" onSubmit={(e) => handleSubmitSurveyForm(e)} className="space-y-6">
                            {questions.map((q: QuestionEntry, idx: number) => (
                                <div key={idx}>
                                    <label className="font-medium text-lg text-DarkerPrimary">
                                        {q.question_text} {q.required && <span className="text-red-500">*</span>}
                                    </label>

                                    {q.type === "Likert" && (
                                        <div className="flex gap-3 mt-2 text-DarkerPrimary">
                                            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                                <label key={num} className="flex flex-col gap-1">
                                                    <input 
                                                        type="radio" 
                                                        name={`likert-${idx}`} 
                                                        value={num} 
                                                        checked={answers[idx] === num}
                                                        onChange={() => handleAnswerChange(idx, num)}
                                                        required={q.required}
                                                    /> 
                                                    {num}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === "FileUpload" && (
                                        <div className="mt-2">
                                            <input 
                                                type="file" 
                                                name={`file-upload-${idx}`} 
                                                onChange={(e) => handleAnswerChange(idx, e.target.files)}
                                                className="border border-2 border-Primary w-full p-4 rounded-xl text-Primary"
                                                required={q.required}
                                            />
                                        </div>
                                    )}

                                    {q.type === "OpenEnded" && (
                                        <textarea
                                            name={`open-${idx}`}
                                            className="border border-2 border-Primary w-full p-4 mt-2 rounded-xl bg-[#f3f9ff] focus:outline-none placeholder-[#97A9BE]"
                                            rows={4}
                                            placeholder="Your answer"
                                            value={answers[idx] || ""}
                                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                            required={q.required}
                                        />
                                    )}

                                    {q.type === "Dropdown" && (
                                        <div className="relative">
                                            <select 
                                                name={`dropdown-${idx}`} 
                                                className="appearance-none border border-2 border-Primary text-Primary w-full py-2 px-5 mt-2 rounded-full bg-[#f3f9ff] focus:outline-none placeholder-[#97A9BE]"
                                                value={answers[idx] || ""}
                                                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                                required={q.required}
                                            >
                                                <option value="">Select an option</option>
                                                {q.options?.map((opt, i) => (
                                                    <option key={i} value={opt}>
                                                    {opt}
                                                    </option>
                                                ))}
                                            </select>  
                                            {/* Custom Arrow */}
                                            <div className="pointer-events-none absolute right-5 top-1/2 text-gray-500">
                                                <Triangle size={12} style={{ fill: '#A9C1DE', color: '#A9C1DE' }} className="rotate-180"/>
                                            </div>
                                        </div>
                                    )}

                                    {q.type === "MultipleChoice" && (
                                        <div className="flex flex-col mt-2 gap-1 text-Primary">
                                        {q.options?.map((opt, i) => (
                                            <label key={i}>
                                                <input 
                                                    type="checkbox" 
                                                    name={`multi-${idx}`} 
                                                    checked={answers[idx]?.includes(opt) || false}
                                                    onChange={(e) => {
                                                    const current = answers[idx] || [];
                                                    const updated = e.target.checked
                                                        ? [...current, opt]
                                                        : current.filter((o: string) => o !== opt);
                                                    handleAnswerChange(idx, updated);
                                                    }}
                                                    className="mr-2 checkbox border border-Primary bg-[#f3f9ff] rounded-sm"
                                                    required={q.required}
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                        </div>
                                    )}

                                    {q.type === "YesOrNo" && (
                                        <div className="flex gap-4 mt-2 text-Primary">
                                        {q.options?.map((opt, i) => (
                                            <label key={i}>
                                            <input 
                                                type="radio" 
                                                name={`yesno-${idx}`} 
                                                value={opt} 
                                                checked={answers[idx] === opt}
                                                onChange={() => handleAnswerChange(idx, opt)}
                                                className="mr-1"
                                                required={q.required}
                                            />
                                            {opt}
                                            </label>
                                        ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Survey Buttons */}
                            <div className="flex flex-row justify-end gap-3 sm:gap-4 mt-auto">
                                <Button
                                    variant="minor"
                                    onClick={() => navigate(-1)}
                                    type="button"
                                    className="!border-none !text-Primary !w-auto !py-2 sm:!py-3 !px-6 sm:!px-8 !rounded-xl text-sm sm:text-base"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="major"
                                    onClick={() => {}}
                                    type="submit"
                                    className="!border-none !w-auto !py-2 sm:!py-3 !px-6 sm:!px-8 !rounded-xl text-sm sm:text-base"
                                >
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserSurveyPage;