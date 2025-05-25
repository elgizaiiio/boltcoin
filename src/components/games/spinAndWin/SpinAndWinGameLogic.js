import { supabase } from '@/lib/supabaseClient';
 
    export const TICKET_PRICE_TON = 0.1; 
    export const BOLTCOIN_TREASURY_WALLET = 'UQCiVNm22dMF9S3YsHPcgrmqXEQHt4MIdk_N7VJu88NrLr4R';

    export const segments = [
      { type: 'bolt', value: 5, label: '5 $BOLT', color: '#f59e0b' },
      { type: 'ticket', value: 1, label: '1 Ticket', color: '#10b981' },
      { type: 'bolt', value: 10, label: '10 $BOLT', color: '#f59e0b' },
      { type: 'bolt', value: 2, label: '2 $BOLT', color: '#f59e0b' }, 
      { type: 'bolt', value: 20, label: '20 $BOLT', color: '#f59e0b' },
      { type: 'ticket', value: 2, label: '2 Tickets', color: '#10b981' },
      { type: 'bolt', value: 50, label: '50 $BOLT', color: '#f59e0b' },
      { type: 'bolt', value: 1, label: '1 $BOLT', color: '#f59e0b' }, 
    ];

    export const fetchSpinTickets = async (userProfile, setTickets) => {
      if (userProfile?.id) {
        const { data, error } = await supabase
          .from('users')
          .select('spin_tickets')
          .eq('id', userProfile.id)
          .single();
        if (error) {
          console.error('Error fetching spin tickets:', error);
          setTickets(parseInt(localStorage.getItem('spinTicketsFallback') || '1'));
        } else if (data) {
          setTickets(data.spin_tickets !== null ? data.spin_tickets : 1);
        }
      } else {
         setTickets(parseInt(localStorage.getItem('spinTicketsFallback') || '1'));
      }
    };

    export const updateTicketsInDB = async (userId, newTicketCount) => {
        if (!userId) return;
        const { error } = await supabase
            .from('users')
            .update({ spin_tickets: newTicketCount })
            .eq('id', userId);
        if (error) console.error("Error updating tickets in DB:", error);
    };


    export const determineWinningSegment = () => {
        const randomSpins = Math.floor(Math.random() * 5) + 5; 
        const targetSegmentIndex = Math.floor(Math.random() * segments.length);
        const segmentAngle = 360 / segments.length;
        const targetRotation = (randomSpins * 360) + (targetSegmentIndex * segmentAngle) - (segmentAngle / 2) + (Math.random() * segmentAngle * 0.8 - segmentAngle * 0.4);
        return { winningSegment: segments[targetSegmentIndex], targetRotation };
    };

    export const processSpinWin = async (winningSegment, currentTickets, userId, updateBoltBalance, setTickets, t, toast) => {
        let rewardMessage = '';
        let newTicketCount = currentTickets;

        if (winningSegment.type === 'bolt') {
            updateBoltBalance(winningSegment.value);
            rewardMessage = t('games:spinAndWin.wonMessage', { prize: `${winningSegment.value} $BOLT` });
        } else if (winningSegment.type === 'ticket') {
            newTicketCount = currentTickets + winningSegment.value;
            setTickets(newTicketCount);
            await updateTicketsInDB(userId, newTicketCount);
            rewardMessage = t('games:spinAndWin.wonMessage', { prize: `${winningSegment.value} Ticket(s)` });
        }
        
        toast({
            title: t('games:spinAndWin.congratsTitle'),
            description: rewardMessage,
        });
    };

    export const createBuyTicketsTransactionTon = (buyAmount, userProfile) => {
      const totalCost = buyAmount * TICKET_PRICE_TON;
      const payloadComment = `buy_spin_tickets_ton_${buyAmount}_user_${userProfile?.id || 'unknown_user'}_time_${Date.now()}`;
      
      return {
        validUntil: Math.floor(Date.now() / 1000) + 600, 
        messages: [
          {
            address: BOLTCOIN_TREASURY_WALLET,
            amount: (totalCost * 1_000_000_000).toString(), 
            payload: btoa(payloadComment)
          },
        ],
      };
    };