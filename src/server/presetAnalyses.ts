import { PaperAnalysis } from '../types/paper';

export const FALLBACK_PRESET_ANALYSES: Record<string, PaperAnalysis> = {
  '2205.14135': {
    paperTitle: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
    authors: ['Tri Dao', 'Daniel Y. Fu', 'Stefano Ermon', 'Atri Rudra', 'Christopher Ré'],
    year: '2022',
    venueOrArxiv: 'arXiv:2205.14135 (NeurIPS 2022)',
    url: 'https://arxiv.org/abs/2205.14135',
    oneLineHook: 'IO-aware exact attention algorithm computing softmax and matrix multiplication with sub-quadratic memory reads/writes between GPU HBM and SRAM.',
    coreConcept: {
      problemStatement:
        'Standard Multi-Head Attention scales quadratically in time and memory with sequence length O(N²). Modern GPUs spend most time reading and writing the intermediate N×N attention matrix to slow High-Bandwidth Memory (HBM) rather than performing arithmetic in fast SRAM.',
      methodology:
        'FlashAttention reorganizes attention computation to be IO-aware. It splits the input Query, Key, and Value matrices into blocks, loads them into fast GPU on-chip SRAM, computes attention with an incremental online softmax reduction, and computes gradients without storing the N×N intermediate matrix by recomputing it on the fly during backward passes.',
      mathematicalBreakthroughs:
        'Online Softmax formulation allowing the scaling denominator to be updated iteratively across block increments (m_new = max(m_prev, row_max), l_new = exp(m_prev - m_new) * l_prev + row_sum), completely bypassing the need to materialize the full N×N attention matrix in GPU memory.',
      summaryText:
        'FlashAttention tackles the primary memory bottleneck of transformers: slow data transfers between GPU high-bandwidth memory (HBM) and fast on-chip SRAM. Rather than materializing the full N-by-N attention matrix in slow memory, FlashAttention tiles the input matrices into smaller blocks and computes exact attention using an iterative online softmax algorithm. It never stores the large attention matrix in global memory, instead recomputing it during the backward pass. This cuts memory IO from quadratic O(N²) to linear O(N), delivering 2x to 4x speedups and allowing models to scale to significantly longer sequence lengths without any accuracy approximations.',
      wordCount: 104,
    },
    mermaidFlowchart: `graph TD
    subgraph Inputs
      Q[Query Matrix Q in HBM]
      K[Key Matrix K in HBM]
      V[Value Matrix V in HBM]
    end

    subgraph GPU_SRAM_Tiling [On-Chip GPU SRAM Processing]
      Tiler[IO-Aware Block Tiler]
      Qi[Load Block Qi into SRAM]
      Kj[Load Block Kj into SRAM]
      Vj[Load Block Vj into SRAM]
      S_ij[Compute Local Scores S_ij = Qi * Kj^T / sqrt d]
      OnlineSoftmax[Online Softmax: Update running max & sum without full matrix]
      O_accum[Accumulate Output Block Oi in SRAM]
    end

    subgraph Outputs
      O_final[Final Attention Output O in HBM]
      Stats[Online Softmax Stats m, l for Backward Pass]
    end

    Q --> Tiler
    K --> Tiler
    V --> Tiler
    Tiler --> Qi
    Tiler --> Kj
    Tiler --> Vj
    Qi --> S_ij
    Kj --> S_ij
    S_ij --> OnlineSoftmax
    Vj --> O_accum
    OnlineSoftmax --> O_accum
    O_accum --> O_final
    OnlineSoftmax --> Stats`,
    futureWorkAndInternships: [
      {
        id: 'project-1',
        title: 'Lightweight Mamba-Flash Hybrid for Edge Devices',
        exactExtension:
          'Replacing standard self-attention in the lower transformer blocks with a hardware-fused selective State Space (Mamba) block, while retaining FlashAttention only in upper layers for hierarchical edge inference.',
        targetedPerformanceMetric:
          '45% reduction in latency and 60% reduction in peak VRAM consumption on embedded edge platforms (e.g. Jetson Orin / Apple Silicon) with <0.5% perplexity degradation.',
        recommendedTechStack: ['PyTorch', 'ONNX Runtime', 'Triton', 'Hugging Face Transformers'],
        difficultyLevel: 'Intermediate',
        estimatedTimelineWeeks: 4,
        weeklyRoadmap: [
          'Week 1: Benchmark baseline FlashAttention transformer on Wikitext-103 using PyTorch profiler.',
          'Week 2: Implement hybrid module swapping alternating attention layers with Mamba SSM state projections.',
          'Week 3: Export the hybrid architecture to ONNX Runtime and optimize operator fusions for edge devices.',
          'Week 4: Benchmark tokens/sec, VRAM footprint, write GitHub documentation with latency charts.'
        ],
        interviewTalkingPoint:
          'Demonstrates mastery of hardware-level sequence bottlenecks, profiling GPU compute vs memory IO bound regimes, and orchestrating hybrid architectures for edge deployment constraints.',
        starterCodeSnippet: `import torch
import torch.nn as nn

class HybridFlashMambaBlock(nn.Module):
    def __init__(self, d_model, n_heads, use_ssm=False):
        super().__init__()
        self.use_ssm = use_ssm
        if use_ssm:
            self.proj = nn.Linear(d_model, d_model)
            self.state = nn.Parameter(torch.zeros(1, d_model))
        else:
            self.attn = nn.MultiheadAttention(d_model, n_heads, batch_first=True)
            
    def forward(self, x):
        if self.use_ssm:
            return x + torch.relu(self.proj(x))
        return x + self.attn(x, x, x)[0]`,
        hardwareRequirements: 'Single free Google Colab T4 GPU or local 8GB+ GPU',
      },
      {
        id: 'project-2',
        title: 'FP8 / Int8 Quantized Tiling Kernel with Bit-Shift Softmax',
        exactExtension:
          'Quantizing the SRAM block representations from FP16 to FP8 E4M3 with calibrated clipping and bit-shift power-of-two approximations for the online softmax exponentiation.',
        targetedPerformanceMetric:
          '2.1x speedup in SRAM GEMM throughput and 50% memory bandwidth traffic reduction with minimal loss on Llama-3 8B zero-shot evals.',
        recommendedTechStack: ['PyTorch', 'Triton Kernel DSL', 'CUDA / C++', 'BitsAndBytes'],
        difficultyLevel: 'Advanced',
        estimatedTimelineWeeks: 4,
        weeklyRoadmap: [
          'Week 1: Write a pure Python reference of tiled online softmax with simulated FP8 quantizers.',
          'Week 2: Port the tiled logic to an elementary OpenAI Triton kernel with block size tuning.',
          'Week 3: Benchmark SRAM bandwidth saturation and compute throughput against PyTorch standard F.scaled_dot_product_attention.',
          'Week 4: Package as a pip-installable library and publish reproducible benchmark scripts.'
        ],
        interviewTalkingPoint:
          'Showcases deep systems engineering capability: writing custom Triton GPU kernels, navigating low-precision numerical formats (FP8), and profiling memory memory hierarchies.',
        starterCodeSnippet: `@triton.jit
def _fused_quant_attention_kernel(Q, K, V, Out, sm_scale):
    # Triton kernel with FP8 block accumulation
    pass`,
        hardwareRequirements: 'Colab A100 or local RTX 4080/4090 with FP8 tensor core support',
      },
      {
        id: 'project-3',
        title: 'Sparse-Windowed IO-Aware Attention for Million-Token Audio Streams',
        exactExtension:
          'Extending FlashAttention with dynamic local sliding-window masks and landmark summary tokens specifically tailored for streaming 16kHz continuous audio spectrograms.',
        targetedPerformanceMetric:
          'Enabling 1M+ token context window processing in under 4GB VRAM with constant-time generation latency.',
        recommendedTechStack: ['PyTorch', 'Torchaudio', 'Hugging Face Datasets', 'Wandb'],
        difficultyLevel: 'Intermediate',
        estimatedTimelineWeeks: 3,
        weeklyRoadmap: [
          'Week 1: Profile Torchaudio Whisper attention patterns on long speech recordings.',
          'Week 2: Introduce block-sparse mask to the IO-aware tiler to skip irrelevant cross-block tiles.',
          'Week 3: Evaluate WER (Word Error Rate) vs latency savings across 1-hour audio files.'
        ],
        interviewTalkingPoint:
          'Combines practical domain application (speech/audio transformers) with algorithmic memory optimization to solve a real-world long-context inference challenge.',
        starterCodeSnippet: `def create_streaming_sparse_mask(seq_len, window_size=512):
    row_idx = torch.arange(seq_len).unsqueeze(-1)
    col_idx = torch.arange(seq_len).unsqueeze(0)
    return (row_idx - col_idx).abs() <= window_size`,
        hardwareRequirements: 'Consumer GPU (6GB+ VRAM)',
      },
    ],
    systemArchitectureNotes: {
      inputs: ['Query Tensor Q (B, H, N, d)', 'Key Tensor K (B, H, N, d)', 'Value Tensor V (B, H, N, d)'],
      layers: [
        'IO-Aware SRAM Block Tiler',
        'Tile Matrix Multiplications (Q_i * K_j^T)',
        'Incremental Online Softmax Rescaling',
        'Tile Output Accumulator (O_i += P_ij * V_j)',
        'Backward Pass Recomputation Engine'
      ],
      outputs: ['Attention Output Tensor O (B, H, N, d)', 'Logsumexp statistics vector (B, H, N)'],
      computationalComplexity: 'Time: O(N² d) FLOPs, IO: O(N d) memory accesses to HBM (sub-quadratic IO)',
    },
    tokenAudit: {
      promptTokens: 1240,
      completionTokens: 890,
      totalTokens: 2130,
      tokenLimit: 25000,
      tokenEfficiencyScore: 'Exceptional (<8k tokens)',
      durationMs: 1420,
    },
  },
  '2312.00752': {
    paperTitle: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    authors: ['Albert Gu', 'Tri Dao'],
    year: '2023',
    venueOrArxiv: 'arXiv:2312.00752',
    url: 'https://arxiv.org/abs/2312.00752',
    oneLineHook: 'Linear-time sequence model matching Transformer quality using input-dependent selection mechanisms and a hardware-aware parallel associative scan.',
    coreConcept: {
      problemStatement:
        'Transformers achieve dominant modeling capabilities but suffer from quadratic O(N²) computational complexity during training and linear time complexity per token O(N) during autoregressive generation due to KV caching. Previous linear State Space Models (SSMs) lacked content-based reasoning.',
      methodology:
        'Mamba equips structured state space models with a selective mechanism that makes matrix parameters (B, C, and step size Delta) dynamic functions of the current input token x_t. To train efficiently, it introduces a hardware-aware parallel scan that fuses the recurrent updates directly in GPU SRAM.',
      mathematicalBreakthroughs:
        'Selective Discretization where continuous SSM parameters (A, B) are discretized via zero-order hold using input-dependent Delta(x), combined with an O(N) hardware-fused parallel associative scan over the recurrence h_t = A_bar_t * h_{t-1} + B_bar_t * x_t.',
      summaryText:
        'Mamba overcomes the fundamental speed-capacity trade-off between Transformers and recurrent models. Traditional Transformers allow rich context-aware attention but suffer from quadratic slowdown as sequences grow. Meanwhile, previous State Space Models (SSMs) ran in linear time but had static, time-invariant parameters that prevented selective information filtering. Mamba makes the SSM parameters dynamic functions of the input tokens, allowing the model to selectively remember relevant facts and purge noise. Coupled with a hardware-fused parallel scan on GPU SRAM, Mamba runs 5x faster than Transformers of equal size, achieves linear-time inference with no KV-cache growth, and scales to million-token contexts.',
      wordCount: 104,
    },
    mermaidFlowchart: `graph TD
    subgraph Input_Stream
      X[Input Sequence X of shape B, L, D]
    end

    subgraph Mamba_Block [Selective SSM Block]
      InProj[Input Linear Projection to 2 * Inner_Dim]
      Branch1[Conv1D + SiLU Activation Branch]
      Branch2[Gated Gating Branch]
      DeltaProj[Input-Dependent Delta Projection]
      B_C_Proj[Input-Dependent B & C Matrix Projections]
      Discretize[Zero-Order Hold Discretization A_bar, B_bar]
      ParallelScan[Hardware-Fused Parallel Associative Scan in SRAM]
      GateMult[Elementwise Gated Multiplication]
      OutProj[Output Linear Projection to D]
    end

    subgraph Output_Stream
      Y[Output Sequence Y with Linear-Time Complexity]
    end

    X --> InProj
    InProj --> Branch1
    InProj --> Branch2
    Branch1 --> DeltaProj
    Branch1 --> B_C_Proj
    DeltaProj --> Discretize
    B_C_Proj --> Discretize
    Branch1 --> ParallelScan
    Discretize --> ParallelScan
    ParallelScan --> GateMult
    Branch2 --> GateMult
    GateMult --> OutProj
    OutProj --> Y`,
    futureWorkAndInternships: [
      {
        id: 'project-1',
        title: 'Mamba-Vision Backbone for Real-Time Semantic Segmentation on Edge Devices',
        exactExtension:
          'Adapting bidirectional 2D selective SSM scans for dense pixel grids to replace ViT attention in mobile robot semantic segmentation.',
        targetedPerformanceMetric:
          '3.2x higher FPS (Frames Per Second) at 1080p resolution on NVIDIA Jetson with equal mIoU on Cityscapes.',
        recommendedTechStack: ['PyTorch', 'TensorRT', 'OpenCV', 'Albumentations'],
        difficultyLevel: 'Intermediate',
        estimatedTimelineWeeks: 4,
        weeklyRoadmap: [
          'Week 1: Setup Cityscapes dataset and benchmark baseline MobileNetV3 / SegFormer.',
          'Week 2: Implement 4-directional spatial SSM scanning block in PyTorch.',
          'Week 3: Train segmentation head and evaluate mIoU vs FLOPs.',
          'Week 4: Export to TensorRT engine and benchmark on-device inference latency.'
        ],
        interviewTalkingPoint:
          'Highlights systems and computer vision expertise: adapting 1D linear sequence formulations to 2D spatial manifolds and optimizing real-time perception for robotics.',
        starterCodeSnippet: `import torch
import torch.nn as nn

class BiDirectionalSSM2D(nn.Module):
    def __init__(self, d_model):
        super().__init__()
        self.proj_h = nn.Linear(d_model, d_model)
        self.proj_v = nn.Linear(d_model, d_model)
        
    def forward(self, img_features):
        # Scan along rows and columns with linear SSM
        B, C, H, W = img_features.shape
        return img_features`,
        hardwareRequirements: 'Local GPU or Google Colab T4/V100',
      },
      {
        id: 'project-2',
        title: 'Int4 Post-Training Quantization of Mamba Delta and State Matrices',
        exactExtension:
          'Developing an asymmetric integer quantization scheme for the recurrent hidden states and Delta step sizes without exploding state drift.',
        targetedPerformanceMetric:
          '72% reduction in memory footprint and zero state drift over 100,000 autoregressive steps on LM-Eval.',
        recommendedTechStack: ['PyTorch', 'AutoGPTQ', 'Triton', 'NumPy'],
        difficultyLevel: 'Advanced',
        estimatedTimelineWeeks: 4,
        weeklyRoadmap: [
          'Week 1: Profile activation and state magnitude distributions across Mamba-130M and 370M.',
          'Week 2: Formulate dynamic outlier clipping for Delta and A_bar matrices.',
          'Week 3: Implement Int4 packed GEMV kernel in Triton.',
          'Week 4: Benchmark perplexity on Lambada and push open-source GitHub repo.'
        ],
        interviewTalkingPoint:
          'Demonstrates deep understanding of numerical stability in recurrent dynamic systems, PTQ (post-training quantization), and writing custom low-precision kernels.',
        starterCodeSnippet: `def quantize_state_tensor(state, bits=4):
    scale = state.abs().max() / (2**(bits-1) - 1)
    q_state = torch.clamp(torch.round(state / scale), -8, 7)
    return q_state, scale`,
        hardwareRequirements: 'Colab T4 or local RTX 3060+',
      },
      {
        id: 'project-3',
        title: 'Long-Form Code Repository Search with Linear Mamba Embeddings',
        exactExtension:
          'Fine-tuning Mamba as a bi-encoder for million-token codebase retrieval, bypassing the 8k token limit of BERT/RoBERTa embeddings.',
        targetedPerformanceMetric:
          'Enabling repository-wide AST semantic retrieval over 500k LOC codebases in <50ms query time.',
        recommendedTechStack: ['PyTorch', 'Tree-sitter', 'Hugging Face', 'FAISS'],
        difficultyLevel: 'Intermediate',
        estimatedTimelineWeeks: 3,
        weeklyRoadmap: [
          'Week 1: Parse GitHub Python repositories into syntax trees using Tree-sitter.',
          'Week 2: Fine-tune Mamba using InfoNCE contrastive loss on docstring-to-code pairs.',
          'Week 3: Index 100 repositories into FAISS and measure Mean Reciprocal Rank (MRR@10).'
        ],
        interviewTalkingPoint:
          'Shows software engineering maturity: building developer tooling, combining static analysis (Tree-sitter) with cutting-edge SSM sequence retrieval.',
        starterCodeSnippet: `class MambaCodeBiEncoder(nn.Module):
    def __init__(self, mamba_model):
        super().__init__()
        self.backbone = mamba_model
    def encode(self, code_tokens):
        hidden = self.backbone(code_tokens)
        return hidden.mean(dim=1) # Mean pooling over linear sequence`,
        hardwareRequirements: 'Consumer GPU (8GB VRAM)',
      },
    ],
    systemArchitectureNotes: {
      inputs: ['Token Input Tensor X (Batch, Length, Dimension)'],
      layers: [
        'Linear Expansion (1x to 2x d_inner)',
        '1D Depthwise Convolution (kernel size 4)',
        'Input-dependent Parameter Projections (Delta, B, C)',
        'Zero-Order Hold Discretization Operator',
        'Hardware-Fused Parallel Associative Scan in SRAM',
        'Multiplicative Gating Connection (SiLU)',
        'Linear Output Contraction Projection'
      ],
      outputs: ['Hidden Output Tensor Y (Batch, Length, Dimension)'],
      computationalComplexity: 'Training: O(N) FLOPs and memory via scan, Generation: O(1) FLOPs per step (constant-time)',
    },
    tokenAudit: {
      promptTokens: 1420,
      completionTokens: 960,
      totalTokens: 2380,
      tokenLimit: 25000,
      tokenEfficiencyScore: 'Exceptional (<8k tokens)',
      durationMs: 1610,
    },
  },
  '1706.03762': {
    paperTitle: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'et al.'],
    year: '2017',
    venueOrArxiv: 'arXiv:1706.03762 (NeurIPS 2017)',
    url: 'https://arxiv.org/abs/1706.03762',
    oneLineHook: 'Foundational sequence transduction model based entirely on self-attention mechanisms, dispensing with recurrence and convolutions entirely.',
    coreConcept: {
      problemStatement:
        'Dominant sequence models relied on recurrent neural networks (RNNs, LSTMs, GRUs) which operate sequentially along the time dimension, precluding parallelization within training examples and struggling with long-distance dependency resolution.',
      methodology:
        'The Transformer architecture replaces sequential recurrence with multi-head self-attention, allowing the network to model relationships between all pairs of tokens in parallel regardless of their distance, supplemented by sinusoidal positional encodings and position-wise feed-forward sublayers.',
      mathematicalBreakthroughs:
        'Scaled Dot-Product Attention: Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V, scaling by 1/sqrt(d_k) to prevent dot products from growing excessively large and vanishing softmax gradients, coupled with Multi-Head projection concatenation.',
      summaryText:
        'Attention Is All You Need introduced the Transformer, replacing recurrent and convolutional neural networks with a pure self-attention mechanism. Recurrent architectures were inherently sequential, preventing parallel training across long sentences and struggling to retain information over long distances. The Transformer models dependencies between any two words simultaneously by computing scaled dot-product attention scores across parallel heads. Combined with sinusoidal positional encodings and feed-forward networks, this architecture enables massive parallelization on GPUs, setting the foundation for modern large language models, machine translation, and multimodal AI.',
      wordCount: 94,
    },
    mermaidFlowchart: `graph TD
    subgraph Inputs
      InTokens[Input Sequence Tokens]
      PosEnc[Sinusoidal Positional Encoding]
    end

    subgraph Encoder_Stack [N x Transformer Encoder Layers]
      AddPos[Sum: Token Embeddings + Positional Encodings]
      MHA_Enc[Multi-Head Self-Attention Q, K, V]
      AddNorm1[Residual Add & LayerNorm]
      FFN[Position-Wise Feed-Forward Network]
      AddNorm2[Residual Add & LayerNorm]
    end

    subgraph Decoder_Stack [N x Transformer Decoder Layers]
      DecTokens[Target Tokens Shifted Right]
      MaskedMHA[Masked Multi-Head Self-Attention]
      CrossMHA[Cross-Attention: Queries from Dec, Keys/Values from Enc]
      DecFFN[Decoder Feed-Forward Network]
    end

    subgraph Outputs
      LinearOut[Linear Projection to Vocab Size]
      Softmax[Softmax Probability Distribution]
    end

    InTokens --> AddPos
    PosEnc --> AddPos
    AddPos --> MHA_Enc
    MHA_Enc --> AddNorm1
    AddPos --> AddNorm1
    AddNorm1 --> FFN
    FFN --> AddNorm2
    AddNorm1 --> AddNorm2
    AddNorm2 --> CrossMHA

    DecTokens --> MaskedMHA
    MaskedMHA --> CrossMHA
    CrossMHA --> DecFFN
    DecFFN --> LinearOut
    LinearOut --> Softmax`,
    futureWorkAndInternships: [
      {
        id: 'project-1',
        title: 'Rotary Position Embedding (RoPE) Backport & Length Extrapolation Benchmark',
        exactExtension:
          'Replacing original sinusoidal positional encodings with Rotary Position Embeddings (RoPE) and YaRN length extrapolation in a miniature PyTorch Transformer.',
        targetedPerformanceMetric:
          'Expanding zero-shot sequence length capacity from 512 tokens to 4,096 tokens with <2% perplexity drift.',
        recommendedTechStack: ['PyTorch', 'Hugging Face Datasets', 'Wandb'],
        difficultyLevel: 'Intermediate',
        estimatedTimelineWeeks: 3,
        weeklyRoadmap: [
          'Week 1: Implement standard Transformer baseline from scratch in PyTorch.',
          'Week 2: Replace sinusoidal addition with complex-valued 2D rotary matrix multiplication on Q and K.',
          'Week 3: Benchmark length extrapolation on synthetic passkey retrieval and wikitext.'
        ],
        interviewTalkingPoint:
          'Understands the foundational shift from absolute additive embeddings to relative rotational geometry, a standard requirement in LLM pretraining interviews.',
        starterCodeSnippet: `def apply_rotary_emb(x, cos, sin):
    # RoPE transformation
    x1, x2 = x[..., 0::2], x[..., 1::2]
    return torch.cat([x1 * cos - x2 * sin, x1 * sin + x2 * cos], dim=-1)`,
        hardwareRequirements: 'Free Google Colab T4 GPU',
      },
      {
        id: 'project-2',
        title: 'Grouped-Query Attention (GQA) Conversion for Fast Edge Serving',
        exactExtension:
          'Refactoring multi-head attention (MHA) into Grouped-Query Attention (GQA) with 4 query heads per 1 KV head to reduce KV cache footprint during generation.',
        targetedPerformanceMetric:
          '75% reduction in KV cache memory footprint with 1.8x higher batch throughput during autoregressive decoding.',
        recommendedTechStack: ['PyTorch', 'vLLM', 'TorchScript'],
        difficultyLevel: 'Intermediate',
        estimatedTimelineWeeks: 3,
        weeklyRoadmap: [
          'Week 1: Profile KV cache memory consumption across sequence lengths for standard MHA.',
          'Week 2: Implement GQA layer with group replication of K and V projections.',
          'Week 3: Measure tokens/second latency and throughput vs batch size.'
        ],
        interviewTalkingPoint:
          'Articulates how KV-cache memory bandwidth dominates real-world LLM serving costs, and how GQA bridges the gap between MHA quality and MQA speed.',
        starterCodeSnippet: `class GroupedQueryAttention(nn.Module):
    def __init__(self, d_model, num_heads, num_groups):
        super().__init__()
        self.num_groups = num_groups
        self.heads_per_group = num_heads // num_groups`,
        hardwareRequirements: 'Local GPU or Google Colab',
      },
      {
        id: 'project-3',
        title: 'Attention Head Pruning and Visualization Tool for Explainability',
        exactExtension:
          'Building an interactive dashboard measuring head importance via Taylor expansion gradient attribution and pruning redundant heads.',
        targetedPerformanceMetric:
          'Removing 30% of attention heads with zero drop in BLEU translation score while improving CPU inference speed by 25%.',
        recommendedTechStack: ['PyTorch', 'Streamlit / React', 'BertViz', 'Plotly'],
        difficultyLevel: 'Intermediate',
        estimatedTimelineWeeks: 4,
        weeklyRoadmap: [
          'Week 1: Train an English-to-German Transformer on Multi30k.',
          'Week 2: Calculate head importance scores using first-order gradient sensitivity.',
          'Week 3: Prune low-importance heads iteratively and record accuracy curve.',
          'Week 4: Build interactive web visualizer charting attention map specialization.'
        ],
        interviewTalkingPoint:
          'Bridges machine learning theory with software visualization, demonstrating model interpretability and structured pruning methods.',
        starterCodeSnippet: `def compute_head_importance(model, dataloader):
    # Taylor expansion head importance scoring
    pass`,
        hardwareRequirements: 'Consumer laptop or Colab',
      },
    ],
    systemArchitectureNotes: {
      inputs: ['Token IDs (B, Seq_Len)', 'Positional Indices'],
      layers: [
        'Token & Positional Embedding Layer',
        'Multi-Head Self-Attention (Scaled Dot-Product)',
        'Position-Wise Feed-Forward Networks (Two linear layers with ReLU/GELU)',
        'Residual Connections & Layer Normalization',
        'Linear Projection & Softmax Head'
      ],
      outputs: ['Logits over Vocabulary (B, Seq_Len, Vocab_Size)'],
      computationalComplexity: 'Complexity per Layer: O(N² d), Sequential Operations: O(1)',
    },
    tokenAudit: {
      promptTokens: 1100,
      completionTokens: 820,
      totalTokens: 1920,
      tokenLimit: 25000,
      tokenEfficiencyScore: 'Exceptional (<8k tokens)',
      durationMs: 1250,
    },
  },
  '2106.09685': {
    paperTitle: 'LoRA: Low-Rank Adaptation of Large Language Models',
    authors: ['Edward J. Hu', 'Yelong Shen', 'Phillip Wallis', 'Zeyuan Allen-Zhu', 'et al.'],
    year: '2021',
    venueOrArxiv: 'arXiv:2106.09685 (ICLR 2022)',
    url: 'https://arxiv.org/abs/2106.09685',
    oneLineHook: 'Parameter-efficient fine-tuning freezing pretrained model weights and injecting trainable low-rank rank decomposition matrices into Transformer attention layers.',
    coreConcept: {
      problemStatement:
        'Full fine-tuning of massive billion-parameter foundation models requires storing and updating gigabytes of optimizer states and gradients for each downstream task, rendering adaptation computationally prohibitive and storage-inefficient in production.',
      methodology:
        'LoRA hypothesizes that weight updates during model adaptation have a low "intrinsic dimension". It freezes the pretrained weights W_0 and decomposes the weight update delta into two low-rank matrices: delta W = B * A, where A in R^(r x d) is initialized with Gaussian noise and B in R^(d x r) is initialized to zero.',
      mathematicalBreakthroughs:
        'Low-Rank Decomposition: h = W_0 * x + (alpha / r) * (B * A) * x. Because B is zero-initialized, training begins with delta W = 0 without disrupting pretrained capabilities. In deployment, W = W_0 + (alpha / r) * (B * A) can be merged back into W_0 with zero inference latency overhead.',
      summaryText:
        'LoRA solves the massive storage and compute burden of fine-tuning large language models. Rather than retraining all billions of parameters for every new task, LoRA freezes the original model weights and injects small pairs of low-rank matrices into the attention layers. Because the update matrix has rank r (often just 4 or 8) instead of full dimension d, LoRA reduces the number of trainable parameters by up to 10,000 times and GPU memory requirements by 3 times. Crucially, during deployment, the low-rank updates can be permanently fused back into the original weights, introducing zero additional inference latency.',
      wordCount: 104,
    },
    mermaidFlowchart: `graph TD
    subgraph Input_Features
      X[Input Hidden State X in R^d]
    end

    subgraph Pretrained_Frozen_Path
      W0[Frozen Pretrained Weights W0 in R^dxk]
      BaseOut[W0 * X]
    end

    subgraph Trainable_LoRA_Path [Low-Rank Adapters]
      MatrixA[Trainable Matrix A in R^rxd with Gaussian Init]
      MatrixB[Trainable Matrix B in R^kxr with Zero Init]
      Scaling[Scaling Factor: alpha / r]
      DeltaOut[(alpha / r) * B * A * X]
    end

    subgraph Fusion
      Sum[Elementwise Add: BaseOut + DeltaOut]
      Y[Output Hidden State Y in R^k]
    end

    X --> W0
    W0 --> BaseOut
    X --> MatrixA
    MatrixA --> MatrixB
    MatrixB --> Scaling
    Scaling --> DeltaOut
    BaseOut --> Sum
    DeltaOut --> Sum
    Sum --> Y`,
    futureWorkAndInternships: [
      {
        id: 'project-1',
        title: 'QLoRA 4-Bit NormalFloat Quantized Fine-Tuner for Consumer GPUs',
        exactExtension:
          'Combining 4-bit NormalFloat (NF4) weight quantization with double quantization and paged optimizers to fine-tune 7B parameter models on a single 6GB GPU.',
        targetedPerformanceMetric:
          'Enabling 7B model fine-tuning in <5.5GB VRAM with zero degradation in MT-Bench score compared to 16-bit LoRA.',
        recommendedTechStack: ['PyTorch', 'BitsAndBytes', 'Hugging Face PEFT', 'TRL'],
        difficultyLevel: 'Intermediate',
        estimatedTimelineWeeks: 3,
        weeklyRoadmap: [
          'Week 1: Study NF4 information-theoretic quantization and gradient flow.',
          'Week 2: Implement custom LoRA adapter injection over frozen 4-bit linear layers.',
          'Week 3: Benchmark VRAM and training speed across various rank choices (r=8, 16, 64).'
        ],
        interviewTalkingPoint:
          'Demonstrates state-of-the-art PEFT proficiency, memory profiling, and enabling enterprise fine-tuning on accessible commodity hardware.',
        starterCodeSnippet: `from peft import LoraConfig, get_peft_model
lora_config = LoraConfig(r=8, lora_alpha=16, target_modules=["q_proj", "v_proj"])`,
        hardwareRequirements: 'Single consumer GPU with 6GB+ VRAM',
      },
      {
        id: 'project-2',
        title: 'Dynamic Multi-LoRA Switcher for Low-Latency Multi-Tenant Serving',
        exactExtension:
          'Building an asynchronous serving proxy that hot-swaps task-specific LoRA adapters on the fly without reloading the shared frozen 7B backbone.',
        targetedPerformanceMetric:
          'Serving 50 distinct domain adapters concurrently on 1 GPU with <3ms switching overhead.',
        recommendedTechStack: ['Python', 'FastAPI', 'PyTorch', 'Ray Serve'],
        difficultyLevel: 'Advanced',
        estimatedTimelineWeeks: 4,
        weeklyRoadmap: [
          'Week 1: Create multiple specialized adapters (coding, medical, legal).',
          'Week 2: Implement batched inference routing tokens to their respective adapter matrices.',
          'Week 3: Profile GPU memory overhead and cache hits for adapter weights.',
          'Week 4: Write benchmark comparing separate model instances vs multi-LoRA routing.'
        ],
        interviewTalkingPoint:
          'Highlights systems and ML infrastructure engineering: multi-tenancy, batch scheduling, and maximizing GPU resource utilization in production.',
        starterCodeSnippet: `def forward_multi_adapter(x, adapter_ids, adapters):
    # Route input slices to target LoRA matrices
    pass`,
        hardwareRequirements: 'Single 12GB+ GPU',
      },
      {
        id: 'project-3',
        title: 'Singular Value Decomposition (SVD) Auto-Rank Allocator',
        exactExtension:
          'Analyzing pretrained weight spectral energy to dynamically allocate higher rank (r=32) to informative layers and lower rank (r=2) to redundant layers.',
        targetedPerformanceMetric:
          '35% fewer trainable parameters while matching or exceeding uniform r=16 LoRA validation accuracy.',
        recommendedTechStack: ['PyTorch', 'SciPy', 'TorchVision', 'Hugging Face'],
        difficultyLevel: 'Intermediate',
        estimatedTimelineWeeks: 4,
        weeklyRoadmap: [
          'Week 1: Compute SVD singular value decays across all Transformer layers.',
          'Week 2: Formulate budget-constrained rank assignment algorithm based on entropy.',
          'Week 3: Evaluate on GLUE benchmark against standard fixed-rank LoRA.'
        ],
        interviewTalkingPoint:
          'Connects linear algebra fundamentals (SVD, matrix rank, eigenvalues) with practical deep learning optimization.',
        starterCodeSnippet: `def compute_svd_rank_budget(layer_weights, total_budget):
    U, S, V = torch.linalg.svd(layer_weights)
    # Energy allocation based on S
    return allocated_ranks`,
        hardwareRequirements: 'Google Colab T4',
      },
    ],
    systemArchitectureNotes: {
      inputs: ['Input Feature Vector X (B, d)'],
      layers: [
        'Frozen Linear Layer W0 (d x k)',
        'Parallel Trainable Matrix A (d x r) with N(0, 1/r)',
        'Parallel Trainable Matrix B (r x k) with 0 init',
        'Scaling Multiplier (alpha / r)',
        'Addition Operator (W0*X + DeltaW*X)'
      ],
      outputs: ['Adapted Feature Vector Y (B, k)'],
      computationalComplexity: 'Trainable parameters scale as O(r * (d + k)) vs O(d * k) for full tuning',
    },
    tokenAudit: {
      promptTokens: 1180,
      completionTokens: 850,
      totalTokens: 2030,
      tokenLimit: 25000,
      tokenEfficiencyScore: 'Exceptional (<8k tokens)',
      durationMs: 1380,
    },
  },
};
