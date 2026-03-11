import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    courses: [
      { name: 'Quran Nazra', href: '/courses#quran-nazra' },
      { name: 'Basic Tajweed', href: '/courses#basic-tajweed' },
      { name: 'Hifz-ul-Quran', href: '/courses#hifz-ul-quran' },
      { name: 'Namaz & Duas', href: '/courses#namaz-doa' },
      { name: 'Basic Islamic Education', href: '/courses#basic-islamic' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Students', href: '/students' },
      { name: 'Fee Structure', href: '/fee-structure' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
    ],

  };

  return (
    <footer className="bg-[rgba(0,0,102)] text-white border-t border-[rgba(51,102,153)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">Ajwa Academy</span>
            </div>
            <p className="mt-4 text-white/80 max-w-md">
              Quality Quranic education and modern skills online. Dedicated to providing authentic Quranic education and other skill-based courses in a professional and flexible online environment.
            </p>
            <div className="mt-6 flex space-x-6">
              <a href="https://www.facebook.com/ajwaacademyy" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.instagram.com/ajwaacademyofficial/" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://x.com/ajwaacademy786" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2H21l-6.52 7.45L22 22h-6.2l-4.86-6.33L5.3 22H2l7.03-8.03L2 2h6.35l4.4 5.84L18.24 2Zm-1.1 18h1.6L8.9 4h-1.7l9.95 16Z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/http-ajwaacademy.com/?viewAsMember=true" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.threads.com/@ajwaacademyofficial" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white">
                <span className="sr-only">Threads</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.5a7.5 7.5 0 0 0-7.5 7.5v4a7.5 7.5 0 0 0 15 0c0-4.03-3.12-7.33-7.08-7.5h-.42V2.5Zm0 6.25a5.25 5.25 0 1 1 0 10.5A5.25 5.25 0 0 1 12 8.75Zm0 2a3.25 3.25 0 1 0 3.25 3.25A3.25 3.25 0 0 0 12 10.75Z" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Courses</h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.courses.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-base text-white/80 hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-base text-white/80 hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          

        </div>
        
        <div className="py-6 border-t border-white/20 md:flex md:items-center md:justify-between">
          <div className="flex-1 md:order-2">
            <p className="text-center text-base text-white/80 md:text-right">
              &copy; {currentYear} AjwaAcademy. Designed by Khatam Usmani
            </p>
          </div>
          <div className="mt-4 md:mt-0 md:order-1">
            <p className="text-center text-base text-white/80 md:text-left">
              Providing authentic Quranic education worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
