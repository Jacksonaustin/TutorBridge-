function MainContent({ view }) {
  // The selected view is already available here for when each real feature is built.
  // For now the content area intentionally stays empty instead of showing fake data.
  return (
    <main
      className="min-w-0 flex-1 bg-TutorBridge-mid"
      data-view={view}
      aria-label={`${view} content`}
    />
  )
}

export default MainContent
