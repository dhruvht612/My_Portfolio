import { MEDIA } from '../constants/media'

function About({ aboutTab, setAboutTab, aboutTabs, aboutCounters }) {
  const tabOptions = [
    { id: 'story', label: 'My Story', icon: 'fas fa-user' },
    { id: 'interests', label: 'Interests', icon: 'fas fa-heart' },
    { id: 'facts', label: 'Fun Facts', icon: 'fas fa-star' },
  ]

  return (
    <section id="about" className="py-20 px-6 bg-[#0f172a] text-white relative overflow-hidden" aria-labelledby="about-heading">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#22d3ee] opacity-5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#14b8a6] opacity-5 rounded-full blur-3xl" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 id="about-heading" className="text-4xl md:text-5xl font-extrabold animate-gradient mb-4">
            About Me
          </h2>
          <p className="text-gray-400 text-lg">Get to know me better</p>
        </div>
        <div className="grid md:grid-cols-5 gap-10 mb-16">
          <div className="md:col-span-2 flex flex-col items-center">
            <div className="relative mb-8 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#22d3ee] to-[#14b8a6] rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <img
                src={MEDIA.profile}
                alt="Professional headshot of Dhruv Thakar in a casual setting"
                className="relative w-64 h-64 rounded-2xl object-cover shadow-2xl"
                loading="lazy"
              />
            </div>
            <div className="w-full space-y-3 mb-6">
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 hover:border-[#22d3ee] transition-all">
                <div className="flex items-center gap-3">
                  <i className="fas fa-graduation-cap text-2xl text-[#22d3ee]" />
                  <div>
                    <p className="text-xs text-gray-400">Education</p>
                    <p className="text-sm font-semibold">Ontario Tech University</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 hover:border-[#14b8a6] transition-all">
                <div className="flex items-center gap-3">
                  <i className="fas fa-map-marker-alt text-2xl text-[#14b8a6]" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm font-semibold">Oshawa, Ontario</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 hover:border-[#22d3ee] transition-all">
                <div className="flex items-center gap-3">
                  <i className="fas fa-envelope text-2xl text-[#22d3ee]" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-xs font-semibold">thakardhruvh@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full space-y-3">
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-[#22d3ee] to-[#14b8a6] hover:from-[#06b6d4] hover:to-[#0d9488] text-[#0f172a] font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] focus:outline-none focus:ring-2 focus:ring-[#22d3ee] text-center"
              >
                <i className="fas fa-download mr-2" aria-hidden="true" />
                Download Resume
              </a>
              <a
                href="#contact"
                className="block w-full bg-transparent border-2 border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee] hover:text-[#0f172a] font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#22d3ee] text-center"
              >
                <i className="fas fa-paper-plane mr-2" aria-hidden="true" />
                Get In Touch
              </a>
            </div>
          </div>
          <div className="md:col-span-3 space-y-6">
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-4">
              {tabOptions.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`about-tab px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    aboutTab === tab.id ? 'bg-[#14b8a6]/20 text-[#14b8a6]' : 'bg-gray-800/60 text-gray-300'
                  }`}
                  onClick={() => setAboutTab(tab.id)}
                >
                  <i className={`${tab.icon} mr-2`} />
                  {tab.label}
                </button>
              ))}
            </div>
            <div>
              {aboutTab === 'story' && (
                <div className="space-y-4">
                  {aboutTabs.story.map((paragraph, idx) => (
                    <p key={idx} className={`leading-relaxed ${idx === 0 ? 'text-gray-300 text-lg' : 'text-gray-400'}`}>
                      {paragraph.includes('Dhruv Thakar') ? (
                        <>
                          Hey there! 👋 I&apos;m{' '}
                          <span className="font-bold text-white bg-gradient-to-r from-[#22d3ee] to-[#14b8a6] bg-clip-text text-transparent">Dhruv Thakar</span>, a passionate
                          Computer Science student at <span className="text-[#22d3ee]">Ontario Tech University</span>.
                        </>
                      ) : (
                        paragraph
                      )}
                    </p>
                  ))}
                  <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border-l-4 border-[#22d3ee] mt-6">
                    <p className="text-gray-300 italic">
                      <i className="fas fa-quote-left text-[#22d3ee] mr-2" />
                      I believe that technology should be accessible, innovative, and impactful. Every line of code is an opportunity to create something meaningful.
                      <i className="fas fa-quote-right text-[#22d3ee] ml-2" />
                    </p>
                  </div>
                </div>
              )}
              {aboutTab === 'interests' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {aboutTabs.interests.map((interest) => (
                    <div key={interest.title} className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700 hover:border-[#22d3ee] transition-all hover:scale-105">
                      <div className="flex items-start gap-3">
                        <i className={`${interest.icon} text-3xl text-[#22d3ee]`} />
                        <div>
                          <h4 className="font-bold text-white mb-2">{interest.title}</h4>
                          <p className="text-sm text-gray-400">{interest.copy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {aboutTab === 'facts' && (
                <div className="space-y-4">
                  {aboutTabs.facts.map((fact) => (
                    <div key={fact.title} className="flex items-start gap-4 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700 hover:border-[#22d3ee] transition-all">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#22d3ee] to-[#14b8a6] rounded-full flex items-center justify-center text-2xl">{fact.emoji}</div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{fact.title}</h4>
                        <p className="text-sm text-gray-400">{fact.copy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {aboutCounters.map((counter) => (
            <div
              key={counter.label}
              className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm p-6 rounded-xl border border-blue-500/20 text-center hover:scale-105 transition-transform"
            >
              <div className={`text-4xl font-bold mb-2 ${counter.accent}`} data-count={counter.target} data-suffix={counter.suffix}>
                0
              </div>
              <div className="text-sm text-gray-400">{counter.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About

