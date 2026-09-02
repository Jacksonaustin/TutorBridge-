function MainContent({ view }) {
  return (
    <main className="flex-1 bg-TutorBridge-mid p-6 text-TutorBridge-text">
      <p className="text-TutorBridge-muted">
        Current view: <span className="font-semibold text-TutorBridge-text">{view}</span>
      </p>
    </main>
  );
}

export default MainContent;
