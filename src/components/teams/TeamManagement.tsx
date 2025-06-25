import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Send, 
  Copy,
  UserPlus,
  Crown,
  Mail,
  Settings,
  Link,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateSecureId, validateTeamData } from '../../utils/validation';
import LoadingSpinner from '../common/LoadingSpinner';

const TeamManagement: React.FC = () => {
  const { user, teams, createTeam, joinTeam, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState<'my-teams' | 'create' | 'join'>('my-teams');
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
  });
  const [inviteCode, setInviteCode] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Clear errors when switching tabs
  useEffect(() => {
    setErrors([]);
  }, [activeTab]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim() || !user) return;

    try {
      setErrors([]);
      
      // Validate team data
      const teamData = {
        name: newTeam.name.trim(),
        description: newTeam.description.trim(),
        adminId: user.id,
        members: [{
          userId: user.id,
          name: user.name,
          email: user.email,
          role: 'admin' as const,
          joinedAt: new Date(),
        }],
      };

      const validation = validateTeamData(teamData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      await createTeam(teamData);

      setNewTeam({ name: '', description: '' });
      setActiveTab('my-teams');
    } catch (error) {
      console.error('Error creating team:', error);
      setErrors(['Failed to create team. Please try again.']);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      setErrors([]);
      
      if (inviteCode.length < 6) {
        setErrors(['Invite code must be at least 6 characters long']);
        return;
      }

      await joinTeam(inviteCode.toUpperCase());
      setInviteCode('');
      setActiveTab('my-teams');
    } catch (error) {
      console.error('Error joining team:', error);
      setErrors(['Failed to join team. Please check the invite code and try again.']);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sendInvitation = async () => {
    if (!memberEmail.trim()) return;
    
    try {
      // Mock email invitation - in a real app this would send an actual email
      console.log('Sending invitation to:', memberEmail);
      
      // Show success message
      alert(`Invitation sent to ${memberEmail}! They can use the invite code to join your team.`);
      setMemberEmail('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      setErrors(['Failed to send invitation. Please try again.']);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors duration-200">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full w-20 h-20 mx-auto mb-6">
          <Users className="h-12 w-12 text-gray-400 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Team Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Team management features are only available for admin users.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading team management..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500/20 p-3 rounded-xl">
              <Users className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Team Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage your productivity teams
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-700 dark:text-red-400">Error</h4>
                  <ul className="text-sm text-red-600 dark:text-red-300 mt-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'my-teams', label: 'My Teams', icon: Users },
            { id: 'create', label: 'Create Team', icon: Plus },
            { id: 'join', label: 'Join Team', icon: UserPlus },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'my-teams' && (
            <div className="space-y-4">
              {teams.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No teams yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Create your first team to start collaborating
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                  >
                    Create Team
                  </button>
                </div>
              ) : (
                teams.map(team => (
                  <div key={team.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {team.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {team.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
                          <Crown className="h-3 w-3 inline mr-1" />
                          Admin
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Team Stats */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Team Stats</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Members</span>
                            <span className="font-medium text-gray-900 dark:text-white">{team.members.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Created</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {team.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Invite Section */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Invite Members</h4>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg text-sm font-mono">
                              {team.inviteCode}
                            </code>
                            <button
                              onClick={() => copyInviteCode(team.inviteCode)}
                              className="p-2 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                              title="Copy invite code"
                            >
                              {copiedCode === team.inviteCode ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          
                          <div className="flex space-x-2">
                            <input
                              type="email"
                              placeholder="Member email"
                              value={memberEmail}
                              onChange={(e) => setMemberEmail(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                            />
                            <button
                              onClick={sendInvitation}
                              disabled={!memberEmail.trim()}
                              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Members List */}
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Members</h4>
                      <div className="space-y-2">
                        {team.members.map(member => (
                          <div key={member.userId} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                                <span className="text-orange-500 text-sm font-medium">
                                  {member.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                member.role === 'admin' 
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {member.role}
                              </span>
                              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <Settings className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleCreateTeam} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTeam.name}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter team name"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 resize-none"
                  rows={4}
                  placeholder="Describe your team's purpose"
                  maxLength={500}
                />
              </div>

              <button
                type="submit"
                disabled={!newTeam.name.trim() || isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Team...' : 'Create Team'}
              </button>
            </form>
          )}

          {activeTab === 'join' && (
            <form onSubmit={handleJoinTeam} className="space-y-6">
              <div className="text-center mb-6">
                <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <Link className="h-8 w-8 text-blue-500 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Join a Team
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter the invitation code provided by your team admin
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invitation Code *
                </label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-center font-mono text-lg"
                  placeholder="ABCD12"
                  maxLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={!inviteCode.trim() || isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Joining Team...' : 'Join Team'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;