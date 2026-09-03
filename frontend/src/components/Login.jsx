export function LoginCard() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-TutorBridge-dark rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-TutorBridge-text">Login</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-TutorBridge-text">Email</label>
            <input type="email" id="email" name="email" className="w-full px-3 py-2 rounded-md bg-TutorBridge-input text-TutorBridge-text focus:outline-none focus:ring focus:border-TutorBridge-accent" />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-TutorBridge-text">Password</label>
            <input type="password" id="password" name="password" className="w-full px-3 py-2 rounded-md bg-TutorBridge-input text-TutorBridge-text focus:outline-none focus:ring focus:border-TutorBridge-accent" />
          </div>
          <button type="submit" className="w-full bg-TutorBridge-accent text-TutorBridge-text py-2 px-4 rounded-md hover:bg-TutorBridge-accent-hover transition-colors">Login</button>
        </form>
      </div>
    </div>
  )
}