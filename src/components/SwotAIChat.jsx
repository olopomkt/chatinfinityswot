import { useEffect, useRef, useCallback, useTransition } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    SendIcon,
    LoaderIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import * as React from "react"
import logoIcon from "@/assets/ICONACADEMYSF-03.png";

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}) {
    const textareaRef = useRef(null);

    const adjustHeight = useCallback(
        (reset) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

const Textarea = React.forwardRef(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex min-h-[20px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-red-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export function SwotAIChat({ leadData }) {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: '🚀 Bem-vindo ao Stark S.W.O.T.! Para começar, basta enviar qualquer saudação! Sua empresa está a poucos passos do sucesso, vamos lá!',
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 30,
        maxHeight: 60,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
    // Usar setTimeout para garantir que o DOM foi atualizado
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
            behavior: "smooth",
            block: "end"
        });
    }, 100);
};


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    const sendToN8N = async (message) => {
    try {
        const response = await fetch('https://n8n.infinityacademyb2b.com.br/webhook-test/chat-netlify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'chat_message',
                message: message,
                leadData: leadData,
                timestamp: new Date( ).toISOString()
            }),
        });

        if (response.ok) {
            // MUDANÇA: Lê como TEXT em vez de JSON
            const responseText = await response.text();
            
            // Se a resposta não estiver vazia, retorna ela
            if (responseText && responseText.trim()) {
                return responseText.trim();
            }
            
            return "Desculpe, não consegui processar sua mensagem. Tente novamente.";
        } else {
            return "Desculpe, estou com dificuldades técnicas. Tente novamente em alguns instantes.";
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        return "Desculpe, não consegui me conectar. Verifique sua conexão e tente novamente.";
    }
};


    const handleSendMessage = async () => {
        if (value.trim()) {
            const userMessage = {
                id: Date.now().toString(),
                text: value.trim(),
                isUser: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);
            setTimeout(() => scrollToBottom(), 200);
            const messageText = value.trim();
            setValue("");
            adjustHeight(true);

            startTransition(() => {
                setIsTyping(true);
            });

            setTimeout(async () => {
                const aiResponse = await sendToN8N(messageText);
                
                const aiMessage = {
                    id: (Date.now() + 1).toString(),
                    text: aiResponse,
                    isUser: false,
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, aiMessage]);
                setIsTyping(false);
            }, 1500);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-black text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/3 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-700/5 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-red-500/3 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
            </div>

            {/* Chat Container with Glass Effect */}
            <div className="min-h-screen flex items-center justify-center p-4 md:p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-6xl h-[calc(100vh-6rem)] md:h-[calc(100vh-12rem)] backdrop-blur-xl bg-black/60 rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
                    style={{
                        backdropFilter: 'blur(20px)',
                        border: '0.5px solid rgba(255, 255, 255, 0.1)',
                        minHeight: '500px',
                    }}
                >
                    {/* Header */}
                    <div className="relative z-10 p-4 text-center border-b border-white/10 bg-black/20">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-2"
                        >
                            <div className="flex items-center justify-center gap-4 mb-2">
                            <div className="w-12 h-12 flex items-center justify-center">
                                <img 
                                    src={logoIcon} 
                                    alt="Stark S.W.O.T. Logo" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-red-100 leading-tight">
                                    Stark S.W.O.T.
                                </h1>
                                <p className="text-l text-white/70 leading-tight">
                                    O Especialista em Analisar a Saúde da Sua Empresa
                                </p>
                            </div>
                        </div>
                        </motion.div>
                    </div>

                    {/* Messages Area - ESTRUTURA CORRIGIDA */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        
                        {/* Área de Mensagens - AGORA COM FLEX-1 */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={cn(
                                        "flex",
                                        message.isUser ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div className={cn(
                                        "max-w-[80%] rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm",
                                        message.isUser 
                                            ? "bg-red-600 text-white ml-4" 
                                            : "bg-black/60 text-white mr-4 border border-white/10"
                                    )}>
                                        {!message.isUser && (
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className="w-6 h-6 flex items-center justify-center">
                                                    <img 
                                                        src={logoIcon} 
                                                        alt="Stark S.W.O.T." 
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-red-400">Stark S.W.O.T.</span>
                                            </div>
                                        )}
                                        <p className="text-sm leading-relaxed">
                                            {message.text.split("\n").map((line, index) => (
                                                <React.Fragment key={index}>
                                                    {line}
                                                    {index < message.text.split("\n").length - 1 && <br />}
                                                </React.Fragment>
                                            ))}
                                        </p>

                                        <p className={cn(
                                            "text-xs mt-2 opacity-60",
                                            message.isUser ? "text-red-100" : "text-white/60"
                                        )}>
                                            {message.timestamp.toLocaleTimeString('pt-BR', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-black/60 text-white rounded-2xl px-6 py-4 shadow-lg mr-4 backdrop-blur-sm border border-white/10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                <img 
                                                    src={logoIcon} 
                                                    alt="Stark S.W.O.T." 
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-red-400">Stark S.W.O.T.</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-100"></div>
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="relative z-8 p-3 border-t border-white/10 bg-black/20">
                        <motion.div 
                            className="relative backdrop-blur-xl bg-black/20 rounded-2xl border border-white/20 shadow-xl"
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="p-3 flex items-end gap-3">
                                {/* Textarea ocupa todo o espaço disponível */}
                                <div className="flex-1">
                                    <Textarea
                                        ref={textareaRef}
                                        value={value}
                                        onChange={(e) => {
                                            setValue(e.target.value);
                                            adjustHeight();
                                        }}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => setInputFocused(true)}
                                        onBlur={() => setInputFocused(false)}
                                        placeholder="Digite sua mensagem sobre a sua empresa..."
                                        containerClassName="w-full"
                                        className={cn(
                                            "w-full px-4 py-2",
                                            "resize-none",
                                            "bg-transparent",
                                            "border-none",
                                            "text-white text-sm",
                                            "focus:outline-none",
                                            "placeholder:text-white/50",
                                            "min-h-[20px]",
                                            "max-h-[80px]",
                                            "custom-scrollbar-small"
                                        )}
                                    />
                                </div>
                                
                                {/* Botão alinhado com a base do textarea */}
                                <motion.button
                                    onClick={handleSendMessage}
                                    className={cn(
                                        "p-2.5 rounded-full bg-red-600 text-white transition-all duration-200 flex-shrink-0",
                                        "hover:bg-red-700 hover:shadow-lg",
                                        "disabled:opacity-50 disabled:cursor-not-allowed",
                                        "shadow-lg"
                                    )}
                                    disabled={!value.trim() || isTyping}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isTyping ? (
                                        <LoaderIcon className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <SendIcon className="w-4 h-4" />
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
