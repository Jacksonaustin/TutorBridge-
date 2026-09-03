import { PlusIcon, SearchIcon } from './Icons'

function Home({ onNavClick }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <p className="mb-2 text-sm font-bold tracking-widest text-TutorBridge-accent">
        WELCOME TO TUTORBRIDGE
      </p>

      <h1 className="text-4xl font-bold tracking-tight text-TutorBridge-text sm:text-5xl">
        Find help. Offer help.
      </h1>

      <p className="mt-3 max-w-3xl text-lg leading-8 text-TutorBridge-muted">
        TutorBridge connects students who need academic support with students who are willing to tutor.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onNavClick('browse')}
          className="flex items-center gap-4 rounded-xl border border-TutorBridge-input bg-TutorBridge-dark p-5 text-left transition-colors hover:bg-TutorBridge-input"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-TutorBridge-accent text-TutorBridge-text">
            <SearchIcon />
          </span>
          <span>
            <span className="block text-lg font-bold text-TutorBridge-text">Browse requests</span>
            <span className="block text-TutorBridge-muted">Find a student you can help</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavClick('request')}
          className="flex items-center gap-4 rounded-xl border border-TutorBridge-input bg-TutorBridge-dark p-5 text-left transition-colors hover:bg-TutorBridge-input"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-TutorBridge-online text-TutorBridge-text">
            <PlusIcon />
          </span>
          <span>
            <span className="block text-lg font-bold text-TutorBridge-text">Request tutoring</span>
            <span className="block text-TutorBridge-muted">Post a topic you need help with</span>
          </span>
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-TutorBridge-input bg-TutorBridge-dark p-5">
        <h2 className="text-2xl font-bold text-TutorBridge-text">How it works</h2>

        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-TutorBridge-input font-bold text-TutorBridge-text">1</span>
            <div>
              <h3 className="font-bold text-TutorBridge-text">Post</h3>
              <p className="text-TutorBridge-muted">Create a tutoring request.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-TutorBridge-input font-bold text-TutorBridge-text">2</span>
            <div>
              <h3 className="font-bold text-TutorBridge-text">Browse</h3>
              <p className="text-TutorBridge-muted">Tutors find a request.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-TutorBridge-input font-bold text-TutorBridge-text">3</span>
            <div>
              <h3 className="font-bold text-TutorBridge-text">Connect</h3>
              <p className="text-TutorBridge-muted">A tutor volunteers to help.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-TutorBridge-input border-l-4 border-l-TutorBridge-accent bg-TutorBridge-dark px-6 py-5">
        <p className="text-xs font-bold tracking-widest text-TutorBridge-accent">OUR MISSION</p>
        <p className="mt-2 max-w-5xl text-base leading-7 text-TutorBridge-muted">
          TutorBridge provides a centralized website where students can find, connect with, and volunteer to tutor other students. The platform makes it easier for students to access academic support while creating opportunities for knowledgeable students to give back to their community.
        </p>
      </div>
    </section>
  )
}

export default Home
