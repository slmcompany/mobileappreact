import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface HomeAgentCTAProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  image?: any;
  primaryButtonAction?: () => void;
  secondaryButtonAction?: () => void;
  containerStyle?: object;
  showTextInsteadOfImage?: boolean;
  alternativeText?: string;
  primaryNavigateTo?: string;
  secondaryNavigateTo?: string;
}

const HomeAgentCTA = ({
  title = 'Bắt đầu Bán hàng ngay~!',
  description = 'Mở khóa Thư viện Nội dung của SLM ngay khi có hợp đồng đầu tiên thành công để "bỏ túi" thêm thật nhiều bí kíp, giúp bạn tự tin hơn trên con đường chinh phục đỉnh cao bán hàng nhé!',
  primaryButtonText = 'Tạo Báo giá',
  secondaryButtonText = 'Chính sách Đại lý',
  image,
  primaryButtonAction,
  secondaryButtonAction,
  containerStyle = {},
  showTextInsteadOfImage = false,
  alternativeText = 'SLM',
  primaryNavigateTo = '/(agent)/quote',
  secondaryNavigateTo = '/(agent)/policy'
}: HomeAgentCTAProps) => {
  const router = useRouter();
  const [imageError, setImageError] = React.useState(false);
  
  const handlePrimaryButtonPress = () => {
    if (primaryButtonAction) {
      primaryButtonAction();
    } else if (primaryNavigateTo) {
      router.push(primaryNavigateTo as any);
    }
  };
  
  const handleSecondaryButtonPress = () => {
    if (secondaryButtonAction) {
      secondaryButtonAction();
    } else if (secondaryNavigateTo) {
      router.push(secondaryNavigateTo as any);
    }
  };
  
  const handleImageError = () => {
    console.log('Lỗi khi tải hình ảnh');
    setImageError(true);
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.imageContainer}>
        {showTextInsteadOfImage || imageError ? (
          <View style={styles.alternativeTextContainer}>
            <Text style={styles.alternativeText}>{alternativeText}</Text>
          </View>
        ) : (
          <Image 
            source={image || require('../../assets/images/chat-icon.png')} 
            style={styles.image}
            resizeMode="contain"
            onError={handleImageError}
          />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.buttonOutlined, styles.buttonFlex]} 
            onPress={handleSecondaryButtonPress}
          >
            <Text style={styles.buttonTextOutlined}>{secondaryButtonText}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.buttonPrimary, styles.buttonFlex]}
            onPress={handlePrimaryButtonPress}
          >
            <View style={styles.buttonContentWithIcon}>
              <Image 
                source={require('../../assets/images/white-plus-icon.png')} 
                style={styles.buttonIcon} 
                resizeMode="contain"
              />
              <Text style={styles.buttonText}>{primaryButtonText}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  image: {
    width: 200,
    height: 120,
  },
  alternativeTextContainer: {
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  alternativeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  buttonFlex: {
    flex: 1,
    marginBottom: 0,
  },
  buttonPrimary: {
    backgroundColor: '#ED1C24',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutlined: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ED1C24',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonTextOutlined: {
    color: '#ED1C24',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContentWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: {
    width: 16,
    height: 16,
  },
});

export default HomeAgentCTA; 