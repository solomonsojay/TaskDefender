import React from 'react';

interface TeamMember {
  name: string;
  position: string;
  bio: string;
  image?: string;
}

interface TeamSectionProps {
  members: TeamMember[];
}

const TeamSection: React.FC<TeamSectionProps> = ({ members }) => {
  return (
    <section id="team" className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Our Team
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
          NOCODE NINJAS SOLUTIONS - Crafting productivity tools with expertise and passion
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
              <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full mx-auto mb-4 overflow-hidden">
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-orange-500">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {member.name}
              </h3>
              <p className="text-orange-600 dark:text-orange-400 mb-3">{member.position}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;