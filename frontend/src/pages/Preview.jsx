// import React from 'react';
// import Header from '../components/Header';
// import About from '../components/About';
// import Projects from '../components/Projects';
// import Contact from '../components/Contact';
// // Skills and Experience are mapped manually in the original App.jsx

// const Preview = ({ formData }) => {
//   return (
//     <div className="bg-white shadow-2xl rounded-xl overflow-hidden min-h-[800px] border border-gray-200">
//         {/* This mock browser bar makes it look like a real website preview */}
//         <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center space-x-2">
//         <div className="w-3 h-3 rounded-full bg-red-400"></div>
//         <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
//         <div className="w-3 h-3 rounded-full bg-green-400"></div>
//         <div className="flex-1 ml-4 bg-white rounded-md h-6 border border-gray-300 text-xs flex items-center px-2 text-gray-500">
//             localhost:3000/portfolio/{formData.name.toLowerCase().replace(/\s/g, '')}
//         </div>
//         </div>

//         {/* Content */}
//         <div className="p-0">
//         <Header name={formData.name} title={formData.title} />
//         <About about={formData.about} />
        
//         {/* Skills Section */}
//         <div className="px-8 py-10 bg-gray-50">
//             <h2 className="text-3xl font-bold mb-6 text-center">Skills</h2>
//             <div className="flex flex-wrap justify-center gap-4">
//                 {formData.skills && formData.skills.map((skill, i) => (
//                     <span key={i} className="bg-white px-6 py-3 rounded-full shadow-sm text-gray-700 font-medium border border-gray-200">{skill}</span>
//                 ))}
//             </div>
//         </div>
        
//         {/* Experience Section */}
//         <div className="px-8 py-10 max-w-4xl mx-auto">
//             <h2 className="text-3xl font-bold mb-8 text-center">Work Experience</h2>
//             <div className="space-y-8">
//                 {formData.experience && formData.experience.map((exp, i) => (
//                     <div key={i} className="border-l-4 border-indigo-600 pl-6 py-2">
//                         <h3 className="text-xl font-bold">{exp.role}</h3>
//                         <div className="text-indigo-600 font-medium mb-1">{exp.company} | {exp.duration}</div>
//                         <p className="text-gray-600 mt-2">{exp.description}</p>
//                     </div>
//                 ))}
//             </div>
//         </div>

//         <Projects projects={formData.projects} />

//         {/* Blog Section */}
//         {formData.blogs && formData.blogs.length > 0 && (
//             <div className="px-8 py-10 bg-gray-50">
//                 <h2 className="text-3xl font-bold mb-8 text-center">Latest Articles</h2>
//                 <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
//                     {formData.blogs.map((blog, i) => (
//                         <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
//                             <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{blog.date}</span>
//                             <h3 className="font-bold text-lg mt-2 mb-2">{blog.title}</h3>
//                             <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.excerpt}</p>
//                             <a href="#" className="text-indigo-600 font-medium text-sm flex items-center hover:underline">
//                                 Read More <span className="ml-1">→</span>
//                             </a>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         )}

//         <Contact contact={formData.contact} />
//         </div>
//     </div>
//   );
// };

// export default Preview;
