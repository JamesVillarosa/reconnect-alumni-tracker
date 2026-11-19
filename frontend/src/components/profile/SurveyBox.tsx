import { useEffect, useState } from "react";
import FormProps from "../../types/formQuestions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";

export const UserSurveyBox: React.FC<{ userID: string }> = ({ userID }) => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const [unansweredSurveys, setUnansweredSurveys] = useState<FormProps[]>([]);
    const [answeredSurveys, setAnsweredSurveys] = useState<FormProps[]>([]);

    const fetchUnansweredSurveys = async() => {
        try {
            // get unanswered forms data
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/survey/surveys-unanswered/${userID}`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedUnansweredFormsData = response.data;
            setUnansweredSurveys(fetchedUnansweredFormsData.unanswered_forms);
            // console.log("Unanswered form data received:", fetchedUnansweredFormsData);

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    console.log("User is not an admin or token is invalid/missing.");
                } else if (error.response?.status === 500) {
                    console.log("Database error or other server-side issue during processing.");
                }
            }
        }
    }

    const fetchAnsweredSurveys = async() => {
        try {
            // get unanswered forms data
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/survey/surveys-answered/${userID}`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedAnsweredFormsData = response.data;
            setAnsweredSurveys(fetchedAnsweredFormsData.answered_forms);
            // console.log("Answered form data received:", fetchedAnsweredFormsData);

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    console.log("User is not an admin or token is invalid/missing.");
                } else if (error.response?.status === 500) {
                    console.log("Database error or other server-side issue during processing.");
                }
            }
        }
    }

    // fetch data on component mount
    useEffect(() => {
        fetchUnansweredSurveys();
        fetchAnsweredSurveys();
    }, []);

    return (
        <>
            { (!userID) ? 
            <h3 className="text-xs font-bold">Loading indicator here</h3>
            :
                (user?.verification_status !== "Verified") ?
                    <h1 className="text-Error">You are currently unverified</h1>
                    :
                    <>            
                        {/* hide if there are no unanswered surveys */}
                        { !(!unansweredSurveys || unansweredSurveys.length === 0) && 
                            <div className=" flex flex-col gap-1">
                                <h3 className="text-xs font-bold">Unanswered Surveys:</h3>
                                { unansweredSurveys.map((survey, index) => {
                                    return <SurveyButton key={index} surveyTitle={survey.title} onClick={() => navigate('/user/survey', {state: { form: survey } })} />
                                })}
                            </div>
                        }
                        {/* hide if there are no answered surveys */}
                        { !(!answeredSurveys || answeredSurveys.length === 0) && 
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xs font-bold">Answered Surveys:</h3>
                                { answeredSurveys.map((survey, index) => {
                                    return <SurveyButton key={index} surveyTitle={survey.title} onClick={() => navigate('/user/survey', {state: { form: survey } })} />
                                })}
                            </div>
                        }
                        { ((!unansweredSurveys || unansweredSurveys.length === 0) && (!answeredSurveys || answeredSurveys.length === 0)) &&
                            <h3 className="text-xs font-bold">There is nothing here.</h3>
                        } 
                    </>
            }
        </>
    );
}

export const SurveyButton: React.FC<{
    surveyTitle: string,
    onClick: () => void;
}> = ({
    surveyTitle,
    onClick
}) => {
    return (
        <button className="underline underline-offset-2 text-xs text-Primary font-bold text-start" onClick={onClick}>
        {surveyTitle}
        </button>
    );
}