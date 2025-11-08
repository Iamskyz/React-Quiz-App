export default function StartQuiz({ numQuestions, dispatch }) {
  return (
    <div className="start">
      <h2>Welcome to the Quiz App</h2>
      <h3>{numQuestions} Questions to test your react skill</h3>
      <button className="btn ui" onClick={() => dispatch({ type: "start" })}>
        Let's Start
      </button>
    </div>
  );
}
