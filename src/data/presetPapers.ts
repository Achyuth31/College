export interface PresetPaper {
  id: string;
  title: string;
  shortName: string;
  authors: string;
  year: string;
  arxivId: string;
  url: string;
  category: string;
  badgeColor: string;
  description: string;
}

export const PRESET_PAPERS: PresetPaper[] = [
  {
    id: 'flash-attention',
    title: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
    shortName: 'FlashAttention',
    authors: 'Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, Christopher Ré',
    year: '2022',
    arxivId: '2205.14135',
    url: 'https://arxiv.org/abs/2205.14135',
    category: 'Systems & Hardware Acceleration',
    badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    description: 'Tiling and online softmax to compute exact attention without materializing the huge N×N matrix in high-bandwidth GPU memory (HBM).'
  },
  {
    id: 'mamba-ssm',
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    shortName: 'Mamba (Selective SSM)',
    authors: 'Albert Gu, Tri Dao',
    year: '2023',
    arxivId: '2312.00752',
    url: 'https://arxiv.org/abs/2312.00752',
    category: 'Model Architecture & Efficiency',
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    description: 'Selective state space model with input-dependent parameters and hardware-aware associative scan yielding linear-time inference.'
  },
  {
    id: 'attention-is-all-you-need',
    title: 'Attention Is All You Need',
    shortName: 'Transformer (Original)',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, et al.',
    year: '2017',
    arxivId: '1706.03762',
    url: 'https://arxiv.org/abs/1706.03762',
    category: 'Foundational Architecture',
    badgeColor: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
    description: 'Dispenses with recurrence and convolutions entirely, introducing multi-head self-attention and positional encodings.'
  },
  {
    id: 'lora',
    title: 'LoRA: Low-Rank Adaptation of Large Language Models',
    shortName: 'LoRA (Parameter-Efficient Fine-Tuning)',
    authors: 'Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, et al.',
    year: '2021',
    arxivId: '2106.09685',
    url: 'https://arxiv.org/abs/2106.09685',
    category: 'Efficient Fine-Tuning',
    badgeColor: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    description: 'Freezes pretrained weights and injects trainable low-rank rank decomposition matrices into Transformer layers, cutting trainable parameters 10,000x.'
  },
  {
    id: 'bitnet-158',
    title: 'The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits',
    shortName: 'BitNet b1.58',
    authors: 'Shuming Ma, Hongyu Wang, Lingxiao Ma, Lei Wang, et al.',
    year: '2024',
    arxivId: '2402.17764',
    url: 'https://arxiv.org/abs/2402.17764',
    category: 'Extreme Quantization',
    badgeColor: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
    description: 'Every single parameter is ternary {-1, 0, 1}, completely eliminating matrix multiplications (FP16/FP8 MatMul) into pure integer additions.'
  },
  {
    id: 'deepseek-v3',
    title: 'DeepSeek-V3 Technical Report',
    shortName: 'DeepSeek-V3 (MLA & MoE)',
    authors: 'DeepSeek-AI Team',
    year: '2024',
    arxivId: '2412.19437',
    url: 'https://arxiv.org/abs/2412.19437',
    category: 'Large-Scale Mixture-of-Experts',
    badgeColor: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    description: 'Multi-Head Latent Attention (MLA) compressing KV cache into low-dimensional latent vectors and 256 fine-grained MoE routed experts.'
  }
];
