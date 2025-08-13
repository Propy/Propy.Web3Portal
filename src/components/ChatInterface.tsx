import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';

import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

import { useWalletClient, useAccount, useChainId } from "wagmi";

import { propy } from "@jaywelsh/plugin-propy";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";

import { viem } from "@goat-sdk/wallet-viem";

import { GLOBAL_PAGE_HEIGHT } from '../utils/constants';

import {
  centerShortenLongString,
} from '../utils';

import { PropsFromRedux } from '../containers/ChatInterfaceContainer';

import NetworkSelectDropdownContainer from '../containers/NetworkSelectDropdownContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rootDesktop: {
      display: 'flex',
      flexDirection: 'column',
      height: GLOBAL_PAGE_HEIGHT,
      width: 'calc(100% - 250px)',
      position: 'relative',
    },
    rootMobile: {
      display: 'flex',
      flexDirection: 'column',
      height: GLOBAL_PAGE_HEIGHT,
      width: '100%',
      position: 'relative',
    },
    header: {
      borderRadius: 0,
      padding: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
    },
    title: {
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    chatContainer: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: theme.spacing(1),
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(1),
    },
    messageWrapper: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: theme.spacing(1),
      maxWidth: '80%',
    },
    userMessageWrapper: {
      alignSelf: 'flex-end',
      flexDirection: 'row-reverse',
    },
    assistantMessageWrapper: {
      alignSelf: 'flex-start',
    },
    messageBubble: {
      padding: theme.spacing(1.5),
      borderRadius: theme.spacing(2),
      maxWidth: '100%',
      wordWrap: 'break-word',
    },
    userMessage: {
      backgroundColor: '#98d3ff',
      color: theme.palette.primary.contrastText,
    },
    assistantMessage: {
      backgroundColor: theme.palette.grey[100],
      color: theme.palette.text.primary,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#98d3ff',
      color: theme.palette.primary.contrastText,
      flexShrink: 0,
    },
    assistantAvatar: {
      backgroundColor: theme.palette.grey[300],
      color: theme.palette.text.primary,
    },
    inputContainer: {
      borderRadius: 0,
      padding: theme.spacing(2),
      borderTop: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
    },
    inputWrapper: {
      display: 'flex',
      gap: theme.spacing(1),
      alignItems: 'flex-end',
    },
    textField: {
      flex: 1,
    },
    sendButton: {
      minWidth: 'auto',
      padding: theme.spacing(1),
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      opacity: 0.5,
    },
    emptyStateIcon: {
      fontSize: 64,
      marginBottom: theme.spacing(2),
    },
    toolCallsContainer: {
      marginTop: theme.spacing(1),
      padding: theme.spacing(1),
      backgroundColor: theme.palette.grey[50],
      borderRadius: theme.spacing(1),
      fontSize: '0.875rem',
      fontFamily: 'monospace',
      border: `1px solid ${theme.palette.grey[200]}`,
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
    },
    toolCallsHeader: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      padding: theme.spacing(0.5, 0),
      '&:hover': {
        backgroundColor: theme.palette.grey[100],
        borderRadius: theme.spacing(0.5),
      },
    },
    toolCallsTitle: {
      fontWeight: 'bold',
      flex: 1,
      fontSize: '0.875rem',
    },
    toolCallsContent: {
      marginTop: theme.spacing(1),
      maxHeight: '300px',
      overflowY: 'auto',
      overflowX: 'auto',
      width: '100%',
      '& pre': {
        margin: 0,
        whiteSpace: 'pre',
        overflowX: 'auto',
        wordWrap: 'normal',
        wordBreak: 'normal',
      },
    },
    errorMessage: {
      color: theme.palette.error.main,
      fontStyle: 'italic',
    },
  }),
);

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  toolCalls?: any[];
  error?: string;
}

export const ChatInterface = (props: PropsFromRedux) => {
  let { 
    agentApiConfig,
    isConsideredMobile,
  } = props;

  const classes = useStyles();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tools, setTools] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [expandedToolCalls, setExpandedToolCalls] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Wagmi hooks for wallet connection
  const { data: walletClient } = useWalletClient();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  // Simple function to render text with **bold** support
  const renderTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** and make it bold
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return part;
    });
  };

  // Toggle tool calls expansion for a specific message
  const toggleToolCallsExpansion = (messageId: string) => {
    setExpandedToolCalls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize the Web3 tools using wagmi wallet
  useEffect(() => {
    const initializeTools = async () => {
      try {
        if (!walletClient || !isConnected || !address) {
          console.log('Wallet not connected or no wallet client available');
          setIsInitialized(false);
          return;
        }

        const onChainTools = await getOnChainTools({
          wallet: viem(walletClient as any),
          plugins: [
            propy({
              chainId: chainId,
              provider: walletClient.transport.url || `https://rpc.ankr.com/eth_sepolia`, // fallback RPC
            }),
          ],
        });

        setTools(onChainTools);
        setIsInitialized(true);
        console.log('Tools initialized successfully');
      } catch (error) {
        console.error('Failed to initialize tools:', error);
        setIsInitialized(false);
      }
    };

    initializeTools();
  }, [walletClient, isConnected, address, chainId]); // Re-run when wallet connection changes

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !agentApiConfig?.key || !tools || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const toolCalls: any[] = [];

      // Create OpenAI provider with the API key
      const openaiProvider = createOpenAI({
        apiKey: agentApiConfig.key,
        compatibility: 'strict',
      });

      const result = await generateText({
        model: openaiProvider("gpt-4o-mini"),
        tools: tools,
        maxSteps: 10, // Maximum number of tool invocations per request
        prompt: inputValue,
        onStepFinish: (event) => {
          if (event.toolResults && event.toolResults.length > 0) {
            toolCalls.push(...event.toolResults);
          }
        },
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.text,
        isUser: false,
        timestamp: new Date(),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error while processing your request.',
        isUser: false,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const messageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.8 },
  };

  const typingVariants = {
    animate: {
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  const renderMessage = (message: Message) => (
    <motion.div
      key={message.id}
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className={`${classes.messageWrapper} ${
        message.isUser ? classes.userMessageWrapper : classes.assistantMessageWrapper
      }`}
    >
      <div className={`${classes.avatar} ${!message.isUser ? classes.assistantAvatar : ''}`}>
        {message.isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
      </div>
      <div style={{width: '100%'}}>
        <Paper
          className={`${classes.messageBubble} ${
            message.isUser ? classes.userMessage : classes.assistantMessage
          }`}
          elevation={1}
        >
          <Typography 
            variant="body1" 
            className={message.error ? classes.errorMessage : ''}
          >
            {renderTextWithBold(message.text)}
          </Typography>
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className={classes.toolCallsContainer}>
              <div 
                className={classes.toolCallsHeader}
                onClick={() => toggleToolCallsExpansion(message.id)}
              >
                <div className={classes.toolCallsTitle}>
                  Tool Calls ({message.toolCalls.length})
                </div>
                {expandedToolCalls.has(message.id) ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </div>
              
              <AnimatePresence>
                {expandedToolCalls.has(message.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className={classes.toolCallsContent}>
                      {message.toolCalls.map((toolCall, index) => (
                        <div key={index} style={{ marginBottom: '8px' }}>
                          <pre>{JSON.stringify(toolCall, null, 2)}</pre>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </Paper>
      </div>
    </motion.div>
  );

  const canSendMessage = inputValue.trim() && 
                        !isTyping && 
                        agentApiConfig?.key && 
                        isInitialized &&
                        isConnected;

  return (
    <div className={isConsideredMobile ? classes.rootMobile : classes.rootDesktop}>
      {/* Header */}
      <Paper className={classes.header} elevation={0}>
        <Typography variant="h5" className={classes.title}>
          <SmartToyIcon />
          Web3 Agent
        </Typography>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <Typography  style={{marginRight: '8px'}} variant="body2" className="secondary-text-light-mode light-text">
            {!isConnected 
              ? 'Please connect your wallet to use the Web3 agent'
              : isInitialized 
                ? `Your AI-powered Web3 assistant`
                : 'Initializing Web3 tools...'
            }
          </Typography>
        </div>
        <div style={{display: 'flex', alignItems: 'center', marginTop: '8px'}}>
          <Typography style={{marginRight: '8px'}} variant="body2" className="secondary-text-light-mode light-text">
            Using <strong>{address ? centerShortenLongString(address, 10) : ""}</strong> on
          </Typography>
          <NetworkSelectDropdownContainer />
        </div>
        {!agentApiConfig?.key && (
          <Typography variant="body2" color="error">
            Please configure your OpenAI API key to use the agent
          </Typography>
        )}
        {!isConnected && (
          <Typography variant="body2" color="warning">
            Please connect your wallet to enable Web3 functionality
          </Typography>
        )}
      </Paper>

      {/* Chat Container */}
      <div className={classes.chatContainer}>
        <div className={classes.messagesContainer}>
          {messages.length === 0 ? (
            <div className={classes.emptyState}>
              <SmartToyIcon className={classes.emptyStateIcon} />
              <Typography variant="h6" gutterBottom>
                Welcome to Web3 Agent
              </Typography>
              <Typography variant="body2" className="secondary-text-light-mode light-text">
                {!isConnected 
                  ? 'Connect your wallet to start using Web3 features'
                  : 'Ask me about Propy-related Web3 integrations'
                }
              </Typography>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {messages.map(renderMessage)}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`${classes.messageWrapper} ${classes.assistantMessageWrapper}`}
                >
                  <div className={`${classes.avatar} ${classes.assistantAvatar}`}>
                    <SmartToyIcon fontSize="small" />
                  </div>
                  <Paper className={`${classes.messageBubble} ${classes.assistantMessage}`} elevation={1}>
                    <motion.div variants={typingVariants} animate="animate">
                      <Typography variant="body1">Processing...</Typography>
                    </motion.div>
                  </Paper>
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Container */}
      <Paper className={classes.inputContainer} elevation={0}>
        <div className={classes.inputWrapper}>
          <TextField
            className={classes.textField}
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={!isConnected 
              ? "Connect your wallet to enable Web3 features..." 
              : "Ask about Web3, DeFi, or real estate transactions..."
            }
            variant="outlined"
            size="small"
            disabled={isTyping || !isInitialized || !isConnected}
          />
          <IconButton
            className={classes.sendButton}
            onClick={handleSendMessage}
            disabled={!canSendMessage}
            color="primary"
            size="large"
          >
            <SendIcon />
          </IconButton>
        </div>
      </Paper>
    </div>
  );
};