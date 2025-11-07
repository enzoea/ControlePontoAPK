- Aplicativo mobile (Android/iOS) para gestão de ponto por ciclo, ajudando a registrar presença, faltas e substituições por turno (manhã, tarde, noite), com exportação de relatórios.
- Baseado em React Native com navegação por stacks, interface simples e focada nas tarefas do usuário.
Tecnologias

- Framework: react-native 0.82 e react 19.
- Navegação: @react-navigation/native e native-stack .
- Persistência local: realm para armazenamento dos lançamentos.
- Datas: dayjs com timezone America/Sao_Paulo .
- Exportação: xlsx (Excel) e HTML→PDF via react-native-html-to-pdf .
- UI/gestos: react-native-safe-area-context , react-native-gesture-handler , react-native-screens .
Funcionalidades Principais

- Home: ponto de entrada com acesso às funções do app.
- Preenchimento Mensal: aplica presenças por dia/turno dentro do ciclo atual, com regras (ex.: não aplicar em finais de semana).
- Registrar Falta: marca faltas em dias/turnos selecionados, com opção de sobrescrever registros existentes.
- Registrar Substituição:
  - Define substituído por e observações gerais.
  - Marca substituições por turno com observações específicas (manhã/tarde/noite).
- Verificar Informações:
  - Lista todos os lançamentos do ciclo (tabela com status por turno).
  - Exporta relatório do ciclo em XLSX e PDF, incluindo totais de presenças/faltas/substituições e seção de substituições detalhada quando houver.
- Estimativa de Salário: tela dedicada, integrada ao fluxo do app.
- Reset/limpeza:
  - Remove lançamentos vazios para manter o banco limpo.
  - Limpa status por tipo no ciclo (presença/falta/substituição), preservando campos quando necessário.
Modelo de Dados

- Entidade Lancamento : dataISO , cicloInicioISO , cicloFimISO , status por turno ( presenca / falta / substituicao ), substituidoPor , observações gerais e por turno, createdAt / updatedAt .
- Metadados de ciclo: inicioISO e fimISO , calculados dinamicamente conforme regra do dia 16 a 15 do mês seguinte.
Arquitetura

- Navegação: stack navigator com telas Home , EstimativaSalario , PreenchimentoMensal , RegistrarFalta , RegistrarSubstituicao , VerificarInformacoes .
- Organização por pastas:
  - src/app/screens : cada tela com index.tsx , styles.ts , e interfaces.ts .
  - src/app/components : componentes reutilizáveis (ex.: ActionCard , AppButton , InlineHeader , TabelaCiclo , CalendarCiclo , DiaTurnosPicker , LabeledInput ).
  - src/core : lógica de ciclo e tipos de domínio.
  - src/data : persistência ( db.ts ) e exportações ( exportExcel.ts , exportPdf.ts ).
Diferenciais

- Exportações robustas:
  - XLSX: planilha com dias do ciclo e colunas por turno, suportando ✔️ e observações.
  - PDF: relatório formatado com tabela, totais e seção de substituições detalhada.
- Regras de negócio:
  - Aplica/limpa status respeitando finais de semana.
  - Evita sobrescrever com null durante atualizações parciais.
  - Limpeza automática de observações quando não há mais substituições.
Estado Atual

- Projeto configurado com toolchain moderno (RN 0.82, Node >= 20).
- Telas e componentes organizados por responsabilidade, com navegação e tema base prontos.
- Mecanismos de exportação e persistência funcionalmente implementados.

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
