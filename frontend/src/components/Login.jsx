export function LoginCard() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg bg-TutorBridge-dark p-8 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-TutorBridge-text">Login</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-TutorBridge-text">Email</label>
            <input type="email" id="email" name="email" className="w-full rounded-md bg-TutorBridge-input px-3 py-2 text-TutorBridge-text focus:border-TutorBridge-accent focus:outline-none focus:ring" />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-TutorBridge-text">Password</label>
            <input type="password" id="password" name="password" className="w-full rounded-md bg-TutorBridge-input px-3 py-2 text-TutorBridge-text focus:border-TutorBridge-accent focus:outline-none focus:ring" />
          </div>
          <button type="submit" className="w-full rounded-md bg-TutorBridge-accent px-4 py-2 text-TutorBridge-text transition-colors hover:bg-TutorBridge-accent-hover">Login</button>
        </form>
      </div>
    </div>
  )
}
