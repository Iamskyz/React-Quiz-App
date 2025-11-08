import { useEffect, useReducer } from "react";
import Header from "./Header";
import MainPage from "./MainPage";
import Loader from "./Loader";
import Error from "./Error";
import StartQuiz from "./StartQuiz";
import Questions from "./Questions";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishQuiz from "./FinishQuiz";
import Footer from "./Footer";
import Timer from "./Timer";

const SECS_PER_QUESTION = 30;

const initialState = {
  questions: [],
  status: "loading", // loading, error, ready, active, finished
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "dataReceived":
      return { ...state, questions: action.payload, status: "ready" };
    case "dataFailed":
      return { ...state, status: "error" };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SECS_PER_QUESTION,
      };
    case "newAnswer":
      {const question = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      }};
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "finish":
      return {
        ...state,
        status: "finished",
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };
    case "restart":
      return { ...initialState, questions: state.questions, status: "ready" };
    case "tick":
      {const newSeconds = Math.max(state.secondsRemaining - 1, 0);
      return {
        ...state,
        secondsRemaining: newSeconds,
        status: newSeconds === 0 ? "finished" : state.status,
      }};
    case "setHighscore":
      return { ...state, highscore: action.payload };
    default:
      throw new Error("Unknown Action");
  }
};

export default function App() {
  const [
    { questions, status, index, answer, points, highscore, secondsRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );

  // Load highscore from localStorage
  useEffect(() => {
    const storedHighscore = localStorage.getItem("highscore");
    if (storedHighscore) {
      dispatch({ type: "setHighscore", payload: Number(storedHighscore) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("highscore", highscore);
  }, [highscore]);

  // Fetch questions from local JSON file (public/questions.json)
  useEffect(() => {
    fetch("http://localhost:8000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch(() => dispatch({ type: "dataFailed" }));
  }, []);

  return (
    <div className="app">
      <Header />
      <MainPage>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartQuiz numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />
            <Questions
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                index={index}
                numQuestion={numQuestions}
              />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <FinishQuiz
            points={points}
            maxPossiblePoints={maxPossiblePoints}
            highscore={highscore}
            dispatch={dispatch}
          />
        )}
      </MainPage>
    </div>
  );
}
