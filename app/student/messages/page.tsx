import Link from "next/link";

export default function StudentMessages() {
  const threads = [
    {
      id: "1",
      subject: "Question sur les dérivées",
      tutor: "M. Dupont",
      course: "Mathématiques - Terminale",
      lastMessage: "Merci pour votre question. Voici une explication détaillée...",
      lastMessageAt: "2024-09-15T14:30:00Z",
      unreadCount: 2,
      isUnread: true
    },
    {
      id: "2",
      subject: "Planning des séances",
      tutor: "Mme Martin", 
      course: "Physique - Terminale",
      lastMessage: "Parfait, je confirme notre séance de demain à 16h.",
      lastMessageAt: "2024-09-14T10:15:00Z",
      unreadCount: 0,
      isUnread: false
    },
    {
      id: "3",
      subject: "Correction du devoir",
      tutor: "M. Leroy",
      course: "Français - Terminale", 
      lastMessage: "Votre commentaire est très bien structuré. Quelques suggestions...",
      lastMessageAt: "2024-09-13T16:45:00Z",
      unreadCount: 0,
      isUnread: false
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
                Messages
              </h1>
              <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
                Communiquez avec vos tuteurs.
              </p>
            </div>
            <button className="rounded-md bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90">
              Nouveau message
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-7.5 lg:grid-cols-3">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="animate_top rounded-lg border border-stroke bg-white shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <div className="p-6 border-b border-stroke dark:border-strokedark">
                <h2 className="text-lg font-semibold text-black dark:text-white">Conversations</h2>
              </div>
              
              <div className="divide-y divide-stroke dark:divide-strokedark">
                {threads.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/student/messages/${thread.id}`}
                    className={`block p-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      thread.isUnread ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-sm font-medium truncate ${
                            thread.isUnread ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {thread.subject}
                          </h3>
                          {thread.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary rounded-full">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-waterloo dark:text-manatee mb-1">
                          {thread.tutor} • {thread.course}
                        </p>
                        <p className={`text-sm truncate ${
                          thread.isUnread ? 'text-black dark:text-white' : 'text-waterloo dark:text-manatee'
                        }`}>
                          {thread.lastMessage}
                        </p>
                      </div>
                      <div className="ml-2 text-xs text-waterloo dark:text-manatee">
                        {formatDate(thread.lastMessageAt)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="lg:col-span-2">
            <div className="animate_top rounded-lg border border-stroke bg-white shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <div className="p-6 border-b border-stroke dark:border-strokedark">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  Question sur les dérivées
                </h2>
                <p className="text-sm text-waterloo dark:text-manatee">
                  M. Dupont • Mathématiques - Terminale
                </p>
              </div>

              {/* Messages */}
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">M</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-sm text-black dark:text-white">
                        Bonjour M. Dupont, j'ai du mal à comprendre la notion de dérivée. 
                        Pourriez-vous m'expliquer avec un exemple concret ?
                      </p>
                    </div>
                    <p className="text-xs text-waterloo dark:text-manatee mt-1">
                      Vous • 14:25
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">D</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <p className="text-sm text-black dark:text-white">
                        Bonjour Marie ! Bien sûr, je vais vous expliquer avec un exemple simple.
                      </p>
                      <p className="text-sm text-black dark:text-white mt-2">
                        Prenons la fonction f(x) = x². Sa dérivée f'(x) = 2x nous donne 
                        le coefficient directeur de la tangente en chaque point.
                      </p>
                      <p className="text-sm text-black dark:text-white mt-2">
                        Par exemple, en x = 3, f'(3) = 6, ce qui signifie que la tangente 
                        a un coefficient directeur de 6.
                      </p>
                    </div>
                    <p className="text-xs text-waterloo dark:text-manatee mt-1">
                      M. Dupont • 14:30
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">M</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-sm text-black dark:text-white">
                        Merci beaucoup ! C'est beaucoup plus clair maintenant. 
                        Est-ce que vous pourriez me donner un exercice pour m'entraîner ?
                      </p>
                    </div>
                    <p className="text-xs text-waterloo dark:text-manatee mt-1">
                      Vous • 14:35
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Composer */}
              <div className="p-6 border-t border-stroke dark:border-strokedark">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <textarea
                      placeholder="Tapez votre message..."
                      className="w-full p-3 border border-stroke rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition">
                      Envoyer
                    </button>
                    <button className="px-4 py-2 border border-stroke rounded-lg hover:opacity-90 transition dark:border-strokedark">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
