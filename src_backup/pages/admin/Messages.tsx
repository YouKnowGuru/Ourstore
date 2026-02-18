import { useEffect, useState } from 'react';
import { Search, Eye, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { messageAPI } from '@/services/api';
import { formatDate } from '@/utils/helpers';
import { toast } from 'sonner';

const AdminMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await messageAPI.getMessages();
      setMessages(response.data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      await messageAPI.replyToMessage(selectedMessage._id, replyText);
      toast.success('Reply sent');
      setSelectedMessage(null);
      setReplyText('');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await messageAPI.deleteMessage(id);
      toast.success('Message deleted');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Messages</h1>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">From</th>
              <th className="text-left py-3 px-4">Subject</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map((message) => (
              <tr key={message._id} className={`border-t hover:bg-gray-50 ${!message.isRead ? 'bg-blue-50/50' : ''}`}>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium">{message.name}</p>
                    <p className="text-sm text-muted-foreground">{message.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4">{message.subject}</td>
                <td className="py-3 px-4">{formatDate(message.createdAt)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    message.isRead ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {message.isRead ? 'Read' : 'Unread'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 hover:bg-gray-100 rounded"
                      onClick={() => setSelectedMessage(message)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 hover:bg-red-50 rounded text-red-500"
                      onClick={() => handleDelete(message._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>From: {selectedMessage?.name} ({selectedMessage?.email})</span>
              <span className="text-muted-foreground">
                {selectedMessage?.createdAt && formatDate(selectedMessage.createdAt)}
              </span>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="whitespace-pre-wrap">{selectedMessage?.message}</p>
            </div>
            
            {selectedMessage?.reply ? (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">Your Reply:</p>
                <p className="whitespace-pre-wrap">{selectedMessage.reply}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">Reply:</p>
                <textarea
                  className="w-full p-3 border rounded-lg"
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                />
                <button
                  onClick={handleReply}
                  className="w-full py-2 bg-saffron text-white rounded-lg hover:bg-saffron-600"
                >
                  Send Reply
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessages;
