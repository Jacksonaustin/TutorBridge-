import { PlusIcon, SearchIcon } from './Icons'

function Home({ onNavClick }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <p className="mb-2 text-xs font-bold tracking-widest text-TutorBridge-accent sm:text-sm">
        WELCOME TO TUTORBRIDGE
      </p>

      <h1 className="text-3xl font-bold tracking-tight text-TutorBridge-text sm:text-5xl">
        Find help. Offer help.
      </h1>

      <h2 className="mt-3 max-w-3xl text-base leading-7 text-TutorBridge-muted sm:text-lg sm:leading-8">
        TutorBridge connects students who need academic support with students who are willing to tutor.
      </h2>

      <div className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onNavClick('browse')}
          className="flex items-center gap-4 rounded-xl border border-TutorBridge-input bg-TutorBridge-dark p-4 text-left transition-colors hover:bg-TutorBridge-input sm:p-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-TutorBridge-accent text-TutorBridge-on-accent sm:h-12 sm:w-12">
            <SearchIcon />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold text-TutorBridge-text sm:text-lg">
              Browse requests
            </span>
            <span className="block text-sm text-TutorBridge-muted sm:text-base">
              Find a student you can help
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavClick('request')}
          className="flex items-center gap-4 rounded-xl border border-TutorBridge-input bg-TutorBridge-dark p-4 text-left transition-colors hover:bg-TutorBridge-input sm:p-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-TutorBridge-online text-white sm:h-12 sm:w-12">
            <PlusIcon />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold text-TutorBridge-text sm:text-lg">
              Request tutoring
            </span>
            <span className="block text-sm text-TutorBridge-muted sm:text-base">
              Post a topic you need help with
            </span>
          </span>
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-TutorBridge-input bg-TutorBridge-dark p-4 sm:p-5">
        <h2 className="text-xl font-bold text-TutorBridge-text sm:text-2xl">
          How it works
        </h2>

        <div className="mt-4 grid gap-5 md:grid-cols-3 md:gap-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-TutorBridge-input font-bold text-TutorBridge-text">
              1
            </span>
            <div>
              <h3 className="font-bold text-TutorBridge-text">Post</h3>
              <p className="text-sm text-TutorBridge-muted sm:text-base">
                Create a tutoring request.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-TutorBridge-input font-bold text-TutorBridge-text">
              2
            </span>
            <div>
              <h3 className="font-bold text-TutorBridge-text">Browse</h3>
              <p className="text-sm text-TutorBridge-muted sm:text-base">
                Tutors find a request.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-TutorBridge-input font-bold text-TutorBridge-text">
              3
            </span>
            <div>
              <h3 className="font-bold text-TutorBridge-text">Connect</h3>
              <p className="text-sm text-TutorBridge-muted sm:text-base">
                A tutor volunteers to help.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-TutorBridge-input border-l-4 border-l-TutorBridge-accent bg-TutorBridge-dark px-4 py-5 sm:px-6">
        <p className="text-xs font-bold tracking-widest text-TutorBridge-accent">
          OUR MISSION
        </p>
        <p className="mt-2 max-w-5xl text-sm leading-6 text-TutorBridge-muted sm:text-base sm:leading-7">
          TutorBridge provides a centralized website where students can find, connect with, and volunteer to tutor other students. The platform makes it easier for students to access academic support while creating opportunities for knowledgeable students to give back to their community.
        </p>
      </div>
    </section>
  )
}

export default Home
